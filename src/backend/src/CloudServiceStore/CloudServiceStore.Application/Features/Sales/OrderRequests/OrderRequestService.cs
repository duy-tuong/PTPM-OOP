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

    public OrderRequestService(IUnitOfWork unitOfWork, IEmailService emailService, IAppSettings appSettings)
    {
        _unitOfWork = unitOfWork;
        _emailService = emailService;
        _appSettings = appSettings;
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

            var (item, planId, categoryId) = itemDto.ServicePlanId is not null
                ? await BuildServicePlanItemAsync(itemDto.ServicePlanId.Value, itemDto.PeriodMonths, itemDto.Quantity, cancellationToken)
                : await BuildTldItemAsync(itemDto.TldPricingId!.Value, itemDto.DomainName, itemDto.Quantity, isRenewal: false, cancellationToken);

            items.Add(item);
            itemScopes.Add((planId, categoryId));
        }

        var grandSubtotal = items.Sum(i => i.LineTotal);
        var totalPrice = grandSubtotal;

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
            totalPrice = Math.Max(0, grandSubtotal - discount);
        }

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
            Items = items
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
            .Include(i => i.ServicePlan)
            .Include(i => i.TldPricing)
            .Where(i => i.OrderRequest.CustomerId == customerId && i.RenewsFromItemId == null)
            .OrderBy(i => i.ExpiresAt == null)
            .ThenBy(i => i.ExpiresAt);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(i => new MyServiceItemDto
        {
            ItemId = i.Id,
            OrderCode = i.OrderRequest.OrderCode,
            OrderStatus = i.OrderRequest.Status.ToString(),
            ServicePlanName = i.ServicePlan?.Name,
            DomainName = i.DomainName,
            TldName = i.TldPricing?.Tld,
            PeriodMonths = i.PeriodMonths,
            ExpiresAt = i.ExpiresAt,
            ProvisionedIpAddress = i.ProvisionedIpAddress,
            ProvisionedRootPassword = i.ProvisionedRootPassword,
            ProvisionedNameservers = i.ProvisionedNameservers
        }).ToList();

        return PagedResult<MyServiceItemDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<OrderLookupDto> GetByCodeAsync(string orderCode, CancellationToken cancellationToken = default)
    {
        var order = await _unitOfWork.Repository<OrderRequest, int>().Query()
            .Include(o => o.Items).ThenInclude(i => i.ServicePlan)
            .Include(o => o.Items).ThenInclude(i => i.TldPricing)
            .FirstOrDefaultAsync(o => o.OrderCode == orderCode, cancellationToken)
            ?? throw new NotFoundException(nameof(OrderRequest), orderCode);

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
                LineTotal = i.LineTotal
            }).ToList(),
            BankName = _appSettings.BankName,
            BankAccountNumber = _appSettings.BankAccountNumber,
            BankAccountHolder = _appSettings.BankAccountHolder
        };
    }

    public async Task<OrderRequestDto> CreateRenewalAsync(CreateRenewalOrderRequestDto dto, Guid customerId, CancellationToken cancellationToken = default)
    {
        var itemRepository = _unitOfWork.Repository<OrderRequestItem, int>();
        var original = await itemRepository.Query()
            .Include(i => i.OrderRequest)
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

        var customer = await _unitOfWork.Repository<Customer, Guid>().GetByIdAsync(customerId, cancellationToken)
            ?? throw new NotFoundException(nameof(Customer), customerId);

        var (item, _, _) = original.ServicePlanId is not null
            ? await BuildServicePlanItemAsync(original.ServicePlanId.Value, dto.PeriodMonths ?? original.PeriodMonths, original.Quantity, cancellationToken)
            : await BuildTldItemAsync(original.TldPricingId!.Value, original.DomainName, dto.Years ?? original.Quantity, isRenewal: true, cancellationToken);

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
            TotalPrice = item.LineTotal,
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

    // Dùng chung cho CreateAsync (mỗi dòng trong giỏ) và CreateRenewalAsync (item gia hạn) - trả kèm
    // (planId, categoryId) để caller tính khuyến mãi theo dòng mà không cần tra lại DB.
    private async Task<(OrderRequestItem Item, int? PlanId, int? CategoryId)> BuildServicePlanItemAsync(
        int servicePlanId, int? periodMonths, int quantity, CancellationToken cancellationToken)
    {
        var plan = await _unitOfWork.Repository<ServicePlan, int>().GetByIdAsync(servicePlanId, cancellationToken);
        if (plan is null)
        {
            throw new NotFoundException(nameof(ServicePlan), servicePlanId);
        }

        if (!plan.IsActive)
        {
            throw new ValidationException("Gói dịch vụ này hiện không khả dụng để đặt mua.");
        }

        var priceQuery = _unitOfWork.Repository<PlanPrice, int>().Query()
            .Where(p => p.PlanId == servicePlanId && p.IsActive);

        var price = periodMonths is not null
            ? await priceQuery.FirstOrDefaultAsync(p => p.PeriodMonths == periodMonths.Value, cancellationToken)
            : await priceQuery.FirstOrDefaultAsync(p => p.IsDefault, cancellationToken);

        if (price is null)
        {
            throw new ValidationException("Gói dịch vụ chưa có giá cho kỳ hạn đã chọn.");
        }

        var unitPrice = price.PromotionalPrice ?? price.Price;
        var item = new OrderRequestItem
        {
            ServicePlanId = plan.Id,
            PeriodMonths = price.PeriodMonths,
            Quantity = quantity,
            UnitPrice = unitPrice,
            LineTotal = unitPrice * quantity
        };

        return (item, plan.Id, plan.CategoryId);
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

        if (!tldPricing.IsActive)
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
