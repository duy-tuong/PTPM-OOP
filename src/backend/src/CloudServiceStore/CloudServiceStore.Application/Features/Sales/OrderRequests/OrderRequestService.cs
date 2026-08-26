using System.Text.RegularExpressions;
using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Common.Utils;
using CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Domain.Entities.Marketing;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Sales.OrderRequests;

public class OrderRequestService : IOrderRequestService
{
    // Nhãn tên miền (phần trước dấu chấm, chưa gồm TLD) - không cho bắt đầu/kết thúc bằng gạch ngang,
    // chỉ chữ/số/gạch ngang, tối đa 63 ký tự (giới hạn nhãn DNS chuẩn).
    private static readonly Regex DomainLabelPattern = new(@"^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$", RegexOptions.Compiled);

    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailService _emailService;
    private readonly IAppSettings _appSettings;
    private readonly IPaymentGatewayService _paymentGatewayService;
    private readonly IQrCodeFactory _qrCodeFactory;

    public OrderRequestService(
        IUnitOfWork unitOfWork,
        IEmailService emailService,
        IAppSettings appSettings,
        IPaymentGatewayService paymentGatewayService,
        IQrCodeFactory qrCodeFactory)
    {
        _unitOfWork = unitOfWork;
        _emailService = emailService;
        _appSettings = appSettings;
        _paymentGatewayService = paymentGatewayService;
        _qrCodeFactory = qrCodeFactory;
    }

    public async Task<OrderRequestDto> CreateAsync(CreateOrderRequestDto dto, Guid? customerId = null, CancellationToken cancellationToken = default)
    {
        Promotion? promotion = null;
        if (dto.PromotionId is not null)
        {
            promotion = await _unitOfWork.Repository<Promotion, int>().Query()
                .Include(p => p.Scopes)
                .FirstOrDefaultAsync(p => p.Id == dto.PromotionId.Value, cancellationToken);
            if (promotion is null)
            {
                throw new NotFoundException(nameof(Promotion), dto.PromotionId.Value);
            }

            var now = DateTime.UtcNow;
            var isEligible = promotion.IsActive
                && promotion.StartDate <= now
                && promotion.EndDate >= now
                && (promotion.UsageLimit == null || promotion.UsageCount < promotion.UsageLimit);

            if (!isEligible)
            {
                throw new ValidationException("Mã khuyến mãi không còn hiệu lực.");
            }

            if (promotion.CustomerEligibility != PromotionCustomerEligibility.All)
            {
                var hasCompletedOrderBefore = await HasCompletedOrderBeforeAsync(customerId, dto.CustomerEmail, cancellationToken);

                if (promotion.CustomerEligibility == PromotionCustomerEligibility.NewCustomersOnly && hasCompletedOrderBefore)
                {
                    throw new ValidationException("Mã giảm giá chỉ áp dụng cho khách hàng mới.");
                }

                if (promotion.CustomerEligibility == PromotionCustomerEligibility.ExistingCustomersOnly && !hasCompletedOrderBefore)
                {
                    throw new ValidationException("Mã giảm giá chỉ áp dụng cho khách hàng đã từng mua hàng.");
                }
            }
        }

        var items = new List<OrderRequestItem>();
        // Song song với items - lưu (planId, categoryId) của từng dòng để tính khuyến mãi theo dòng mà
        // không phải tra cứu lại DB (ServicePlan/TldPricing đã có sẵn từ vòng lặp validate bên dưới).
        var itemScopes = new List<(int? PlanId, int? CategoryId)>();

        foreach (var itemDto in dto.Items)
        {
            if ((itemDto.ServicePlanId is null) == (itemDto.TldPricingId is null))
            {
                throw new ValidationException("Mỗi dòng trong đơn hàng phải chọn đúng 1 trong 2: gói dịch vụ hoặc tên miền.");
            }

            var provisioning = new NewPurchaseProvisioningInput(itemDto.OsImageId, itemDto.SshPublicKeyId, itemDto.Hostname, itemDto.Tags);
            var (item, planId, categoryId) = itemDto.ServicePlanId is not null
                ? await BuildServicePlanItemAsync(itemDto.ServicePlanId.Value, itemDto.PeriodMonths, itemDto.Quantity, isRenewal: false, grandfatheredPlanPriceId: null, itemDto.Addons, itemDto.ChosenVcpu, itemDto.ChosenRamMb, itemDto.ChosenDiskGb, customerId, provisioning, cancellationToken)
                : await BuildTldItemAsync(itemDto.TldPricingId!.Value, itemDto.DomainName, itemDto.Quantity, isRenewal: false, cancellationToken);

            items.Add(item);
            itemScopes.Add((planId, categoryId));
        }

        var grandSubtotal = items.Sum(i => i.LineTotal);
        // Addon không tham gia khuyến mãi (giữ đơn giản, xem quyết định phạm vi ở Phần 4) - cộng thẳng
        // vào tổng SAU khi tính discount trên grandSubtotal, không đi qua ComputeDiscount/MatchesScope.
        var addonsTotal = items.Sum(i => i.Addons.Sum(a => a.LineTotal));
        var totalPrice = grandSubtotal + addonsTotal;

        if (promotion is not null)
        {
            // Khuyến mãi chỉ giảm giá phần dòng khớp phạm vi mã, không giảm cả đơn nếu đơn trộn sản
            // phẩm không thuộc phạm vi (khác hành vi bản 1-sản-phẩm/đơn cũ vốn áp cho toàn bộ tổng).
            var matchedSubtotal = items
                .Zip(itemScopes, (item, scope) => (item.LineTotal, Matches: MatchesScope(promotion, scope.PlanId, scope.CategoryId)))
                .Where(x => x.Matches)
                .Sum(x => x.LineTotal);

            if (matchedSubtotal == 0)
            {
                throw new ValidationException("Mã khuyến mãi không áp dụng cho sản phẩm nào trong đơn.");
            }

            if (promotion.MinOrderValue is not null && matchedSubtotal < promotion.MinOrderValue)
            {
                throw new ValidationException($"Đơn hàng cần tối thiểu {promotion.MinOrderValue:N0}đ để áp dụng mã khuyến mãi này.");
            }

            var discount = ComputeDiscount(promotion, matchedSubtotal);
            totalPrice = Math.Max(0, grandSubtotal - discount) + addonsTotal;
        }

        var (isFlagged, flagReason) = await EvaluateFraudRiskAsync(dto, totalPrice, customerId, cancellationToken);

        var orderRequest = new OrderRequest
        {
            OrderCode = RequestCodeGenerator.Generate("ORD"),
            CustomerId = customerId,
            CustomerType = dto.CustomerType,
            CustomerName = dto.CustomerName,
            CustomerEmail = dto.CustomerEmail,
            CustomerPhone = dto.CustomerPhone,
            CompanyName = dto.CompanyName,
            TaxCode = dto.TaxCode,
            PromotionId = dto.PromotionId,
            TotalPrice = totalPrice,
            Note = dto.Note,
            Source = "public-website",
            CreatedAt = DateTime.UtcNow,
            Items = items,
            IsFlaggedForReview = isFlagged,
            FlagReason = flagReason
        };

        var orderRepository = _unitOfWork.Repository<OrderRequest, int>();
        await orderRepository.AddAsync(orderRequest, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Email lúc tạo đơn gửi trực tiếp ở đây (không qua Observer) vì tạo mới không phải "đổi trạng
        // thái" - IOrderStatusObserver chỉ chạy khi Admin đổi Status ở bước sau (xem EmailOrderObserver).
        var paymentUrl = $"{_appSettings.PublicBaseUrl}/thanh-toan/{orderRequest.OrderCode}";
        await _emailService.SendAsync(
            dto.CustomerEmail,
            "Đã nhận đơn hàng - Cloudverse",
            $"Cảm ơn bạn đã đặt hàng. Đơn {orderRequest.OrderCode} đang chờ thanh toán, xem hướng dẫn tại: {paymentUrl}",
            cancellationToken);

        return new OrderRequestDto
        {
            Id = orderRequest.Id,
            OrderCode = orderRequest.OrderCode,
            Status = orderRequest.Status.ToString(),
            TotalPrice = orderRequest.TotalPrice,
            CreatedAt = orderRequest.CreatedAt
        };
    }

    public async Task<PagedResult<MyOrderRequestDto>> GetMineAsync(Guid customerId, PaginationParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<OrderRequest, int>();

        var baseQuery = repository.Query()
            .Include(o => o.Items).ThenInclude(i => i.ServicePlan)
            .Include(o => o.Items).ThenInclude(i => i.TldPricing)
            .Include(o => o.Items).ThenInclude(i => i.Addons).ThenInclude(a => a.Addon)
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedAt);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(o => new MyOrderRequestDto
        {
            Id = o.Id,
            OrderCode = o.OrderCode,
            Items = o.Items.Select(OrderRequestItemDto.FromEntity).ToList(),
            TotalPrice = o.TotalPrice,
            Status = o.Status.ToString(),
            CreatedAt = o.CreatedAt
        }).ToList();

        return PagedResult<MyOrderRequestDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<PagedResult<MyServiceItemDto>> GetMyServicesAsync(Guid customerId, PaginationParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<OrderRequestItem, int>();

        // RenewsFromItemId == null - lọc bỏ các dòng "biên lai gia hạn" (Tier 4), chỉ hiện dịch vụ
        // đang sống. Sắp theo ExpiresAt tăng dần (sắp hết hạn nhất lên đầu), item chưa có ExpiresAt
        // (đơn chưa Completed) đẩy xuống cuối.
        var baseQuery = repository.Query()
            .Include(i => i.OrderRequest)
            .Include(i => i.ServicePlan).ThenInclude(p => p!.Category)
            .Include(i => i.TldPricing)
            .Where(i => i.OrderRequest.CustomerId == customerId && i.RenewsFromItemId == null && i.ChangesFromItemId == null)
            .OrderBy(i => i.ExpiresAt == null)
            .ThenBy(i => i.ExpiresAt);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        var dtos = entities.Select(i => new MyServiceItemDto
        {
            ItemId = i.Id,
            OrderCode = i.OrderRequest.OrderCode,
            OrderStatus = i.OrderRequest.Status.ToString(),
            ServicePlanId = i.ServicePlanId,
            ServicePlanName = i.ServicePlan?.Name,
            ServicePlanCategorySlug = i.ServicePlan?.Category.Slug,
            ServicePlanPackageType = i.ServicePlan?.PackageType.ToString(),
            DomainName = i.DomainName,
            TldName = i.TldPricing?.Tld,
            PeriodMonths = i.PeriodMonths,
            ExpiresAt = i.ExpiresAt,
            LifecycleStatus = DunningPolicy.ComputeLifecycleStatus(i.ExpiresAt, i.SuspendedAt, i.TerminatedAt, now),
            OsImageName = i.OsImageName,
            Hostname = i.Hostname,
            ProvisionedIpAddress = i.ProvisionedIpAddress,
            ProvisionedRootPassword = i.ProvisionedRootPassword,
            ProvisionedNameservers = i.ProvisionedNameservers
        }).ToList();

        return PagedResult<MyServiceItemDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<OrderLookupDto> GetByCodeAsync(string orderCode, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<OrderRequest, int>();
        var order = await repository.Query()
            .Include(o => o.Items).ThenInclude(i => i.ServicePlan)
            .Include(o => o.Items).ThenInclude(i => i.TldPricing)
            .Include(o => o.Items).ThenInclude(i => i.Addons).ThenInclude(a => a.Addon)
            .FirstOrDefaultAsync(o => o.OrderCode == orderCode, cancellationToken)
            ?? throw new NotFoundException(nameof(OrderRequest), orderCode);

        string? qrCodeImage = null;
        if (IsBeforePaid(order.Status))
        {
            // Sinh lười (lazy) - chỉ gọi PayOS lúc thật sự cần (lần đầu vào trang, hoặc link cũ đã hết
            // hạn), không gọi lại mỗi lần load trang /thanh-toan trong lúc link còn hiệu lực. LƯU Ý quan
            // trọng (bug thật đã gặp khi live-test): PayOsLinkExpiresAt == null nghĩa là "chưa biết hạn",
            // KHÔNG được coi là "đã hết hạn" - PayOS từ chối tạo link thứ 2 cho cùng OrderCode ("Đơn
            // thanh toán đã tồn tại"), nên chỉ được gọi lại CreatePaymentLinkAsync khi thật sự CÓ mốc hết
            // hạn và mốc đó đã qua.
            if (order.PayOsCheckoutUrl is null
                || (order.PayOsLinkExpiresAt is not null && order.PayOsLinkExpiresAt <= DateTime.UtcNow))
            {
                var link = await _paymentGatewayService.CreatePaymentLinkAsync(order, cancellationToken);
                order.PayOsCheckoutUrl = link.CheckoutUrl;
                order.PayOsQrCode = link.QrCode;
                order.PayOsPaymentLinkId = link.PaymentLinkId;
                order.PayOsLinkExpiresAt = link.ExpiresAt;
                repository.Update(order);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            qrCodeImage = order.PayOsQrCode is not null ? _qrCodeFactory.GenerateFromContent(order.PayOsQrCode) : null;
        }

        return new OrderLookupDto
        {
            OrderCode = order.OrderCode,
            Status = order.Status.ToString(),
            TotalPrice = order.TotalPrice,
            CreatedAt = order.CreatedAt,
            Items = order.Items.Select(i => new OrderLookupItemDto
            {
                ProductName = i.ServicePlan?.Name ?? (i.TldPricing is not null ? $"{i.DomainName}{i.TldPricing.Tld}" : "Sản phẩm"),
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                LineTotal = i.LineTotal,
                ChosenVcpu = i.ChosenVcpu,
                ChosenRamMb = i.ChosenRamMb,
                ChosenDiskGb = i.ChosenDiskGb,
                OsImageName = i.OsImageName,
                ItemKind = i.ChangesFromItemId is not null ? "PlanChange" : i.RenewsFromItemId is not null ? "Renewal" : "New",
                Addons = i.Addons.Select(OrderItemAddonDto.FromEntity).ToList()
            }).ToList(),
            BankName = _appSettings.BankName,
            BankAccountNumber = _appSettings.BankAccountNumber,
            BankAccountHolder = _appSettings.BankAccountHolder,
            PayOsCheckoutUrl = order.PayOsCheckoutUrl,
            PayOsQrCodeImage = qrCodeImage
        };
    }

    private static bool IsBeforePaid(OrderRequestStatus status) =>
        status is OrderRequestStatus.New or OrderRequestStatus.Contacted or OrderRequestStatus.Confirmed;

    public async Task<OrderRequestDto> CreateRenewalAsync(CreateRenewalOrderRequestDto dto, Guid customerId, CancellationToken cancellationToken = default)
    {
        var itemRepository = _unitOfWork.Repository<OrderRequestItem, int>();
        var original = await itemRepository.Query()
            .Include(i => i.OrderRequest)
            .Include(i => i.ServicePlan)
            .Include(i => i.Addons)
            .FirstOrDefaultAsync(i => i.Id == dto.OrderRequestItemId, cancellationToken);

        // Dùng chung 404 cho cả "không tồn tại" lẫn "không phải chủ đơn" - đúng tinh thần tránh lộ
        // thông tin đã áp dụng ở OrderLookupDto (không cho khách đoán được item của người khác tồn tại).
        if (original is null || original.OrderRequest.CustomerId != customerId)
        {
            throw new NotFoundException(nameof(OrderRequestItem), dto.OrderRequestItemId);
        }

        // Item gia hạn (RenewsFromItemId đã có giá trị) không có ExpiresAt riêng - gia hạn tiếp từ 1
        // "biên lai" như vậy sẽ phá vỡ bất biến "chỉ item đang sống mới có ExpiresAt".
        if (original.RenewsFromItemId is not null)
        {
            throw new ValidationException("Không thể gia hạn từ 1 đơn gia hạn khác - vui lòng chọn đúng dịch vụ gốc.");
        }

        // Dunning (Phần 8) - dịch vụ đã bị hủy hẳn (quá hạn quá lâu, dữ liệu bàn giao đã bị xoá) không
        // tự gia hạn lại được qua luồng thông thường, tránh cấp "ExpiresAt mới" cho dữ liệu đã mất.
        if (original.TerminatedAt is not null)
        {
            throw new ValidationException("Dịch vụ đã bị hủy do quá hạn thanh toán quá lâu, vui lòng liên hệ hỗ trợ để được khôi phục.");
        }

        var customer = await _unitOfWork.Repository<Customer, Guid>().GetByIdAsync(customerId, cancellationToken)
            ?? throw new NotFoundException(nameof(Customer), customerId);

        // Grandfathering: chỉ giữ giá cũ khi gia hạn ĐÚNG chu kỳ đã mua trước đó (đổi chu kỳ = thoả
        // thuận mới, tính giá sống) và plan còn bật chính sách này. original.PlanPriceId null nghĩa là
        // item được tạo trước khi tính năng này tồn tại - không có gì để "giữ", tính giá sống như cũ.
        var effectivePeriodMonths = dto.PeriodMonths ?? original.PeriodMonths;
        int? grandfatheredPlanPriceId = original.ServicePlanId is not null
            && original.PlanPriceId is not null
            && effectivePeriodMonths == original.PeriodMonths
            && original.ServicePlan?.AllowGrandfatheredRenewal == true
                ? original.PlanPriceId
                : null;

        // Addon gia hạn theo đúng lựa chọn cũ, tính lại theo đơn giá addon HIỆN HÀNH (không
        // Grandfathering cho addon - quyết định phạm vi đã chốt, xem Addon.cs).
        var renewedAddonSelections = original.Addons
            .Select(a => new AddonSelectionDto { AddonId = a.AddonId, Quantity = a.Quantity })
            .ToList();

        // OS Image (Phần 11) - giữ nguyên OS đã chọn lúc mua đầu (đổi OS coi như dùng luồng "Đổi gói",
        // không hỗ trợ đổi qua gia hạn thường), nhưng phí Windows tính lại theo giá HIỆN HÀNH (không
        // grandfathering riêng cho phí OS - mirror quyết định Addon không grandfathering). Hostname/Tags
        // giữ nguyên hiển thị liên tục qua các lần gia hạn. SshPublicKeyId: null - gia hạn KHÔNG tra cứu
        // lại theo Id, copy trực tiếp snapshot text từ item gốc bên dưới (xem ghi chú SSH Key, Phần 12).
        var provisioning = new NewPurchaseProvisioningInput(original.OsImageId, SshPublicKeyId: null, original.Hostname, original.Tags);
        var (item, _, _) = original.ServicePlanId is not null
            ? await BuildServicePlanItemAsync(original.ServicePlanId.Value, effectivePeriodMonths, original.Quantity, isRenewal: true, grandfatheredPlanPriceId, renewedAddonSelections, original.ChosenVcpu, original.ChosenRamMb, original.ChosenDiskGb, customerId, provisioning, cancellationToken)
            : await BuildTldItemAsync(original.TldPricingId!.Value, original.DomainName, dto.Years ?? original.Quantity, isRenewal: true, cancellationToken);

        // SSH Key (Phần 12) - copy trực tiếp snapshot text từ item gốc, không re-validate format (dữ
        // liệu đã snapshot hợp lệ từ lần mua trước, có thể khác định dạng nếu backend đổi rule sau này).
        item.SshPublicKeySnapshot = original.SshPublicKeySnapshot;

        item.RenewsFromItemId = original.Id;

        var orderRequest = new OrderRequest
        {
            OrderCode = RequestCodeGenerator.Generate("ORD"),
            CustomerId = customerId,
            CustomerType = customer.CustomerType,
            CustomerName = customer.FullName,
            CustomerEmail = customer.Email,
            CustomerPhone = customer.Phone ?? string.Empty,
            CompanyName = customer.CompanyName,
            TaxCode = customer.TaxCode,
            TotalPrice = item.LineTotal + item.Addons.Sum(a => a.LineTotal),
            Source = "renewal",
            CreatedAt = DateTime.UtcNow,
            Items = { item }
        };

        var orderRepository = _unitOfWork.Repository<OrderRequest, int>();
        await orderRepository.AddAsync(orderRequest, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var paymentUrl = $"{_appSettings.PublicBaseUrl}/thanh-toan/{orderRequest.OrderCode}";
        await _emailService.SendAsync(
            customer.Email,
            "Đã nhận đơn hàng - Cloudverse",
            $"Cảm ơn bạn đã gia hạn dịch vụ. Đơn {orderRequest.OrderCode} đang chờ thanh toán, xem hướng dẫn tại: {paymentUrl}",
            cancellationToken);

        return new OrderRequestDto
        {
            Id = orderRequest.Id,
            OrderCode = orderRequest.OrderCode,
            Status = orderRequest.Status.ToString(),
            TotalPrice = orderRequest.TotalPrice,
            CreatedAt = orderRequest.CreatedAt
        };
    }

    // Dùng chung cho CreateAsync (mỗi dòng trong giỏ, isRenewal=false) và CreateRenewalAsync (item gia
    // hạn, isRenewal=true) - trả kèm (planId, categoryId) để caller tính khuyến mãi theo dòng mà không
    // cần tra lại DB.
    //
    // isRenewal đổi 2 việc:
    // 1. Điều kiện Status cho phép: mua mới chỉ Active; gia hạn còn cho cả OutOfStock/Deprecated (khách
    //    cũ vẫn được tiếp tục dùng dịch vụ dù Admin đã ngừng bán mới) - chỉ Archived/Draft mới chặn hẳn.
    // 2. grandfatheredPlanPriceId (chỉ có ý nghĩa khi isRenewal=true): khi khác null, LẤY THẲNG đúng
    //    row PlanPrice đó (Grandfathering - giữ giá cũ) thay vì tra giá sống, kể cả khi row đã
    //    IsCurrent=false do Admin đổi giá sau đó. Caller (CreateRenewalAsync) chịu trách nhiệm quyết
    //    định có áp dụng Grandfathering hay không (đổi chu kỳ / plan tắt policy => truyền null).
    private async Task<(OrderRequestItem Item, int? PlanId, int? CategoryId)> BuildServicePlanItemAsync(
        int servicePlanId, int? periodMonths, int quantity, bool isRenewal, int? grandfatheredPlanPriceId,
        List<AddonSelectionDto> addonSelections, int? chosenVcpu, int? chosenRamMb, int? chosenDiskGb,
        Guid? customerId, NewPurchaseProvisioningInput provisioning, CancellationToken cancellationToken)
    {
        var plan = await _unitOfWork.Repository<ServicePlan, int>().GetByIdAsync(servicePlanId, cancellationToken);
        if (plan is null)
        {
            throw new NotFoundException(nameof(ServicePlan), servicePlanId);
        }

        var isAvailable = isRenewal
            ? plan.Status is ServicePlanStatus.Active or ServicePlanStatus.OutOfStock or ServicePlanStatus.Deprecated
            : plan.Status == ServicePlanStatus.Active;

        if (!isAvailable)
        {
            throw new ValidationException(isRenewal
                ? "Gói dịch vụ này hiện không thể gia hạn."
                : "Gói dịch vụ này hiện không khả dụng để đặt mua.");
        }

        PlanPrice? price;
        if (grandfatheredPlanPriceId is not null)
        {
            price = await _unitOfWork.Repository<PlanPrice, int>().GetByIdAsync(grandfatheredPlanPriceId.Value, cancellationToken);
        }
        else
        {
            var priceQuery = _unitOfWork.Repository<PlanPrice, int>().Query()
                .Where(p => p.PlanId == servicePlanId && p.IsCurrent && p.IsActive);

            price = periodMonths is not null
                ? await priceQuery.FirstOrDefaultAsync(p => p.PeriodMonths == periodMonths.Value, cancellationToken)
                : await priceQuery.FirstOrDefaultAsync(p => p.IsDefault, cancellationToken);
        }

        if (price is null)
        {
            throw new ValidationException("Gói dịch vụ chưa có giá cho kỳ hạn đã chọn.");
        }

        // Custom: không dùng price.Price/PromotionalPrice (bị bỏ qua với PackageType=Custom, xem
        // PlanPrice.DiscountPercent) - tính từ đơn giá vCPU/RAM/Disk của plan x cấu hình khách chọn,
        // dùng ĐÚNG công thức với lúc hiển thị "giá từ" (ServicePlanService.ComputeStartingPrice) để
        // tránh hiển thị 1 giá nhưng lúc mua tính ra giá khác.
        decimal unitPrice;
        int? itemChosenVcpu = null;
        int? itemChosenRamMb = null;
        int? itemChosenDiskGb = null;

        if (plan.PackageType == ServicePlanPackageType.Custom)
        {
            ValidateCustomSelection(plan, chosenVcpu, chosenRamMb, chosenDiskGb);
            itemChosenVcpu = chosenVcpu;
            itemChosenRamMb = chosenRamMb;
            itemChosenDiskGb = chosenDiskGb;
            unitPrice = CustomPlanPricing.ComputeUnitPrice(plan, chosenVcpu!.Value, chosenRamMb!.Value, chosenDiskGb!.Value, price.PeriodMonths, price.DiscountPercent);
        }
        else
        {
            unitPrice = price.PromotionalPrice ?? price.Price;
        }

        // OS Image (Đợt 3, Phần 11) - chỉ validate "nằm trong danh sách cho phép của plan" nếu plan
        // ĐÓ có cấu hình ≥1 OS (mirror đúng cách BuildOrderItemAddonsAsync suy luận addon được phép từ
        // chính bảng nối, không thêm cờ RequiresOsImage riêng để tránh 2 nguồn sự thật lệch nhau) - plan
        // không cấu hình OS nào (Storage/Firewall...) thì bỏ qua, osImageId luôn null ở kết quả.
        var (osImage, osLicenseFee) = await ResolveOsImageAsync(plan.Id, provisioning.OsImageId, price.PeriodMonths, cancellationToken);
        if (osLicenseFee is not null)
        {
            unitPrice += osLicenseFee.Value;
        }

        // SSH Key & Hostname/Tags (Đợt 3, Phần 12) - chỉ có ý nghĩa lúc mua MỚI thật sự (isRenewal=true
        // vẫn đi qua nhánh này để tính lại phí OS, nhưng SshPublicKeyId luôn null từ CreateRenewalAsync
        // và SshPublicKeySnapshot được caller copy trực tiếp từ item gốc SAU khi hàm này trả về).
        var sshPublicKeySnapshot = await ResolveSshPublicKeySnapshotAsync(customerId, provisioning.SshPublicKeyId, cancellationToken);
        var hostname = ValidateAndNormalizeHostname(provisioning.Hostname);
        var tags = string.IsNullOrWhiteSpace(provisioning.Tags) ? null : provisioning.Tags.Trim();
        if (tags is { Length: > 255 })
        {
            throw new ValidationException("Tags tối đa 255 ký tự.");
        }

        var item = new OrderRequestItem
        {
            ServicePlanId = plan.Id,
            PlanPriceId = price.Id,
            PeriodMonths = price.PeriodMonths,
            Quantity = quantity,
            UnitPrice = unitPrice,
            LineTotal = unitPrice * quantity,
            ChosenVcpu = itemChosenVcpu,
            ChosenRamMb = itemChosenRamMb,
            ChosenDiskGb = itemChosenDiskGb,
            OsImageId = osImage?.Id,
            OsImageName = osImage?.Name,
            OsLicenseFee = osLicenseFee,
            SshPublicKeySnapshot = sshPublicKeySnapshot,
            Hostname = hostname,
            Tags = tags,
            Addons = await BuildOrderItemAddonsAsync(plan.Id, price.PeriodMonths, addonSelections, cancellationToken)
        };

        return (item, plan.Id, plan.CategoryId);
    }

    // Gộp 4 field chỉ có ý nghĩa lúc mua MỚI (Đợt 3, Phần 11+12) - tránh BuildServicePlanItemAsync phình
    // thêm tham số int?/string? cùng kiểu rời rạc, dễ nhầm vị trí khi gọi. CreateRenewalAsync luôn
    // truyền SshPublicKeyId: null (xem ghi chú tại đó).
    private sealed record NewPurchaseProvisioningInput(int? OsImageId, int? SshPublicKeyId, string? Hostname, string? Tags);

    // customerId null (về lý thuyết - controller thực tế luôn bắt đăng nhập) + sshPublicKeyId có giá trị
    // = từ chối rõ ràng thay vì âm thầm bỏ qua, tránh khách tưởng nhầm key đã được áp dụng.
    private async Task<string?> ResolveSshPublicKeySnapshotAsync(Guid? customerId, int? sshPublicKeyId, CancellationToken cancellationToken)
    {
        if (sshPublicKeyId is null)
        {
            return null;
        }

        if (customerId is null)
        {
            throw new ValidationException("Cần đăng nhập để dùng SSH Key đã lưu.");
        }

        var sshKey = await _unitOfWork.Repository<CustomerSshKey, int>().Query()
            .FirstOrDefaultAsync(k => k.Id == sshPublicKeyId.Value && k.CustomerId == customerId.Value, cancellationToken);

        if (sshKey is null)
        {
            throw new ValidationException("SSH Key đã chọn không tồn tại hoặc không thuộc về tài khoản của bạn.");
        }

        return sshKey.PublicKey;
    }

    // Hostname kiểu VPS (vd "web-prod-01.domain.com") - cho phép nhiều nhãn phân tách dấu chấm, mỗi
    // nhãn theo đúng luật DNS như DomainLabelPattern (không bắt đầu/kết thúc bằng gạch ngang).
    private static readonly Regex HostnamePattern = new(
        @"^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
        RegexOptions.Compiled);

    private static string? ValidateAndNormalizeHostname(string? hostname)
    {
        if (string.IsNullOrWhiteSpace(hostname))
        {
            return null;
        }

        var trimmed = hostname.Trim();
        if (trimmed.Length > 100 || !HostnamePattern.IsMatch(trimmed))
        {
            throw new ValidationException("Hostname không hợp lệ (chỉ chữ, số, gạch ngang, dấu chấm, tối đa 100 ký tự).");
        }

        return trimmed;
    }

    // Trả về (OsImage đã chọn, phí bản quyền ĐÃ nhân periodMonths cần cộng vào UnitPrice) - osImageId
    // null (khách không chọn OS, hoặc plan không cấu hình OS nào) trả (null, null). WindowsLicenseFeePerMonth
    // là phí CỐ ĐỊNH/tháng (không nhân theo core - xem OsImage.cs), áp dụng như nhau cho Fixed lẫn Custom.
    private async Task<(OsImage? OsImage, decimal? LicenseFee)> ResolveOsImageAsync(
        int servicePlanId, int? osImageId, int periodMonths, CancellationToken cancellationToken)
    {
        var allowedOsImageIds = await _unitOfWork.Repository<ServicePlanOsImage, int>().Query()
            .Where(pi => pi.PlanId == servicePlanId)
            .Select(pi => pi.OsImageId)
            .ToListAsync(cancellationToken);

        // Plan không cấu hình OS nào (Storage/Firewall...) - BỎ QUA hoàn toàn lựa chọn của khách nếu có
        // (khác Addon: danh sách rỗng ở đây nghĩa là "không OS nào được phép", không phải "mọi OS đều
        // được phép" - tránh lỗ hổng chấp nhận OsImageId bất kỳ khi plan chưa từng khai báo OS nào).
        if (allowedOsImageIds.Count == 0 || osImageId is null)
        {
            return (null, null);
        }

        if (!allowedOsImageIds.Contains(osImageId.Value))
        {
            throw new ValidationException("Hệ điều hành đã chọn không thuộc gói dịch vụ này.");
        }

        var osImage = await _unitOfWork.Repository<OsImage, int>().GetByIdAsync(osImageId.Value, cancellationToken);
        if (osImage is null || !osImage.IsActive)
        {
            throw new ValidationException("Hệ điều hành đã chọn hiện không khả dụng.");
        }

        var licenseFee = osImage.Family == OsFamily.Windows && osImage.WindowsLicenseFeePerMonth is not null
            ? osImage.WindowsLicenseFeePerMonth.Value * periodMonths
            : (decimal?)null;

        return (osImage, licenseFee);
    }

    private static void ValidateCustomSelection(ServicePlan plan, int? vcpu, int? ramMb, int? diskGb)
    {
        if (vcpu is null || ramMb is null || diskGb is null)
        {
            throw new ValidationException("Vui lòng chọn cấu hình vCPU/RAM/Disk cho gói tuỳ biến.");
        }

        ValidateCustomValue("vCPU", vcpu.Value, plan.MinVcpu, plan.MaxVcpu, plan.StepVcpu);
        ValidateCustomValue("RAM", ramMb.Value, plan.MinRamMb, plan.MaxRamMb, plan.StepRamMb);
        ValidateCustomValue("Disk", diskGb.Value, plan.MinDiskGb, plan.MaxDiskGb, plan.StepDiskGb);
    }

    private static void ValidateCustomValue(string label, int value, int? min, int? max, int? step)
    {
        if (min is null || max is null || step is null
            || value < min.Value || value > max.Value || (value - min.Value) % step.Value != 0)
        {
            throw new ValidationException($"Giá trị {label} đã chọn không hợp lệ.");
        }
    }

    // Validate + tính giá addon mua kèm 1 dòng ServicePlan - dùng chung cho mua mới (lựa chọn từ
    // khách) và gia hạn (copy lại lựa chọn cũ, xem CreateRenewalAsync). Không grandfathering: luôn
    // đọc Addon.PricePerMonth HIỆN HÀNH, kể cả khi gia hạn (quyết định phạm vi đã chốt).
    private async Task<List<OrderRequestItemAddon>> BuildOrderItemAddonsAsync(
        int servicePlanId, int periodMonths, List<AddonSelectionDto> selections, CancellationToken cancellationToken)
    {
        if (selections.Count == 0)
        {
            return new List<OrderRequestItemAddon>();
        }

        var addonIds = selections.Select(s => s.AddonId).Distinct().ToList();

        // ServicePlanAddon là bảng nối composite key (PlanId, AddonId) - TKey generic của
        // Repository<TEntity,TKey> chỉ thật sự dùng cho GetByIdAsync (xem Repository.cs), không ảnh
        // hưởng .Query(), nên dùng tạm <int> làm TKey không có ý nghĩa gì ở đây.
        var compatibleAddons = await _unitOfWork.Repository<ServicePlanAddon, int>().Query()
            .Where(pa => pa.PlanId == servicePlanId && addonIds.Contains(pa.AddonId))
            .ToDictionaryAsync(pa => pa.AddonId, cancellationToken);

        var addons = await _unitOfWork.Repository<Addon, int>().Query()
            .Where(a => addonIds.Contains(a.Id))
            .ToDictionaryAsync(a => a.Id, cancellationToken);

        var result = new List<OrderRequestItemAddon>();
        foreach (var selection in selections)
        {
            if (!compatibleAddons.TryGetValue(selection.AddonId, out var planAddon))
            {
                throw new ValidationException($"Addon #{selection.AddonId} không thuộc gói dịch vụ này.");
            }

            if (!addons.TryGetValue(selection.AddonId, out var addon) || !addon.IsActive)
            {
                throw new ValidationException($"Addon #{selection.AddonId} hiện không khả dụng.");
            }

            if (selection.Quantity < 1 || selection.Quantity > planAddon.MaxQuantity)
            {
                throw new ValidationException($"Số lượng addon '{addon.Name}' vượt quá giới hạn cho phép ({planAddon.MaxQuantity}).");
            }

            var unitPrice = addon.PricePerMonth * periodMonths;
            result.Add(new OrderRequestItemAddon
            {
                AddonId = addon.Id,
                Quantity = selection.Quantity,
                UnitPrice = unitPrice,
                LineTotal = unitPrice * selection.Quantity
            });
        }

        return result;
    }

    // isRenewal chọn RenewPrice (gia hạn) thay vì RegisterPrice (mua mới) - lần đầu tiên RenewPrice
    // được dùng để tính tiền thật trong hệ thống (trước đó chỉ hiển thị ở bảng giá Admin).
    private async Task<(OrderRequestItem Item, int? PlanId, int? CategoryId)> BuildTldItemAsync(
        int tldPricingId, string? domainName, int quantity, bool isRenewal, CancellationToken cancellationToken)
    {
        var tldPricing = await _unitOfWork.Repository<TldPricing, int>().GetByIdAsync(tldPricingId, cancellationToken);
        if (tldPricing is null)
        {
            throw new NotFoundException(nameof(TldPricing), tldPricingId);
        }

        // isRenewal: cùng chính sách khoan dung với BuildServicePlanItemAsync (Deprecated vẫn cho gia
        // hạn) - TldPricing không có enum Status nhiều bậc như ServicePlan nên tái dùng thẳng
        // IsActive=false làm "Deprecated": chặn đăng ký mới, KHÔNG chặn khách cũ gia hạn tên miền đang
        // sở hữu (vd Admin ngừng bán .io do giá NIC tăng, khách đã mua .io vẫn phải gia hạn được).
        if (!tldPricing.IsActive && !isRenewal)
        {
            throw new ValidationException("Tên miền này hiện không khả dụng để đặt mua.");
        }

        var trimmedDomain = domainName?.Trim();
        if (string.IsNullOrEmpty(trimmedDomain) || !DomainLabelPattern.IsMatch(trimmedDomain))
        {
            throw new ValidationException("Vui lòng nhập tên miền hợp lệ (chỉ chữ, số, gạch ngang, không có dấu chấm).");
        }

        var unitPrice = isRenewal ? tldPricing.RenewPrice : tldPricing.RegisterPrice;
        var item = new OrderRequestItem
        {
            TldPricingId = tldPricing.Id,
            DomainName = trimmedDomain,
            Quantity = quantity,
            UnitPrice = unitPrice,
            LineTotal = unitPrice * quantity
        };

        return (item, null, tldPricing.ServiceCategoryId);
    }

    // Fraud Review (Đợt 2, Phần 9) - rule-based, chỉ dựa dữ liệu đã có trong hệ thống (không gọi threat-
    // intel/API bên ngoài nào - hệ thống không chạm dữ liệu thẻ tín dụng, PayOS là cổng thanh toán duy
    // nhất). KHÔNG chặn đơn - chỉ đánh dấu để Admin duyệt tay (xem AdminOrderRequestDto.IsFlaggedForReview)
    // + loại khỏi auto-provisioning (xem OrderAutoProvisioningBackgroundService). 3 rule độc lập, gộp lý
    // do nếu trúng nhiều rule cùng lúc.
    private async Task<(bool IsFlagged, string? Reason)> EvaluateFraudRiskAsync(
        CreateOrderRequestDto dto, decimal totalPrice, Guid? customerId, CancellationToken cancellationToken)
    {
        var reasons = new List<string>();
        var orderRepository = _unitOfWork.Repository<OrderRequest, int>();

        // Rule 1: số lượng bất thường trên 1 dòng.
        var maxLineQuantity = dto.Items.Count == 0 ? 0 : dto.Items.Max(i => i.Quantity);
        if (maxLineQuantity > _appSettings.FraudMaxQuantityPerLine)
        {
            reasons.Add($"Số lượng 1 dòng vượt ngưỡng ({maxLineQuantity} > {_appSettings.FraudMaxQuantityPerLine}).");
        }

        // Rule 2: tần suất đặt hàng bất thường - cùng email/phone tạo nhiều đơn trong khoảng thời gian
        // ngắn. recentOrderCount là số đơn ĐÃ có trước đó trong cửa sổ - đơn đang tạo sẽ là đơn thứ
        // recentOrderCount+1, nên trúng rule khi recentOrderCount đã đạt ngưỡng (ngưỡng mặc định 3 nghĩa
        // là "đơn thứ 4 trở đi" mới bị gắn cờ, khớp mô tả nghiệp vụ ">3 đơn").
        var windowStart = DateTime.UtcNow.AddMinutes(-_appSettings.FraudOrderWindowMinutes);
        var recentOrderCount = await orderRepository.Query()
            .CountAsync(o => o.CreatedAt >= windowStart && (o.CustomerEmail == dto.CustomerEmail || o.CustomerPhone == dto.CustomerPhone), cancellationToken);
        if (recentOrderCount >= _appSettings.FraudMaxOrdersPerWindow)
        {
            reasons.Add($"Tần suất đặt hàng bất thường ({recentOrderCount + 1} đơn trong {_appSettings.FraudOrderWindowMinutes} phút).");
        }

        // Rule 3: giá trị đơn cao bất thường với khách MỚI (chưa từng có đơn Completed nào trước đó) -
        // khách quen mua giá trị lớn không bị gắn cờ, chỉ khách lần đầu xuất hiện với đơn giá trị cao.
        if (totalPrice > _appSettings.FraudNewCustomerHighValueThreshold)
        {
            var hasCompletedOrderBefore = await HasCompletedOrderBeforeAsync(customerId, dto.CustomerEmail, cancellationToken);

            if (!hasCompletedOrderBefore)
            {
                reasons.Add($"Giá trị đơn cao bất thường với khách mới ({totalPrice:N0}đ).");
            }
        }

        return reasons.Count > 0 ? (true, string.Join(" ", reasons)) : (false, null);
    }

    // Dùng chung cho Fraud Review Rule 3 (Đợt 2, Phần 9) và điều kiện khách mới/khách cũ của mã giảm
    // giá (Đợt 3, Phần 13) - "khách mới" nghĩa là chưa từng có đơn nào Completed. Match theo CustomerId
    // nếu đã đăng nhập, ngược lại theo CustomerEmail (khách vãng lai không có CustomerId).
    private async Task<bool> HasCompletedOrderBeforeAsync(Guid? customerId, string email, CancellationToken cancellationToken)
    {
        var orderRepository = _unitOfWork.Repository<OrderRequest, int>();
        return customerId is not null
            ? await orderRepository.Query().AnyAsync(o => o.CustomerId == customerId && o.Status == OrderRequestStatus.Completed, cancellationToken)
            : await orderRepository.Query().AnyAsync(o => o.CustomerEmail == email && o.Status == OrderRequestStatus.Completed, cancellationToken);
    }

    // planId: chỉ set khi đặt ServicePlan (PromotionScope.ServicePlanId chỉ FK tới ServicePlan, TLD
    // không có scope riêng theo từng tên miền - chỉ theo ServiceCategory hoặc "Toàn bộ").
    private static bool MatchesScope(Promotion promotion, int? planId, int? categoryId) =>
        // Chưa cấu hình scope nào (VD: dữ liệu mẫu WELCOME2026 seed sẵn) = không giới hạn, áp dụng cho
        // mọi sản phẩm - mirror đúng kỳ vọng của Admin khi tạo khuyến mãi mà không chọn phạm vi cụ thể nào.
        promotion.Scopes.Count == 0
        || promotion.Scopes.Any(s => s.ScopeType == ScopeType.All
            || (s.ScopeType == ScopeType.Plan && planId is not null && s.ServicePlanId == planId)
            || (s.ScopeType == ScopeType.Category && categoryId is not null && s.ServiceCategoryId == categoryId));

    private static decimal ComputeDiscount(Promotion promotion, decimal subtotal)
    {
        var discount = promotion.DiscountType == DiscountType.Percentage
            ? subtotal * promotion.DiscountValue / 100m
            : promotion.DiscountValue;

        if (promotion.MaxDiscountAmount is not null && discount > promotion.MaxDiscountAmount)
        {
            discount = promotion.MaxDiscountAmount.Value;
        }

        return discount;
    }
}
