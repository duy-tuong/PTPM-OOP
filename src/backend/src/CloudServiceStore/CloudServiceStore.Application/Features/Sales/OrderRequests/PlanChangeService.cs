using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Utils;
using CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Sales.OrderRequests;

// Đổi gói (Upgrade/Downgrade) + Proration - mắt xích production-critical #2 (cùng hạng mục Price
// Versioning/Grandfathering ở Phần 2). Phạm vi đã chốt: CHỈ đổi giữa 2 gói ServicePlan.PackageType =
// Fixed, CÙNG ServiceCategory, item gốc phải đã Completed (có ExpiresAt) và chưa hết hạn. Không hỗ trợ
// đổi gói Custom (không có cấu hình vCPU/RAM/Disk đích để tính giá - ngoài phạm vi tài liệu gốc).
//
// Công thức Proration (làm tròn VND, không thập phân, xem PDF "Rounding rule"):
//   daysRemaining = (item.ExpiresAt - now).Days      -> <= 0: phải gia hạn trước khi đổi gói
//   daysInCycle   = 30 * item.PeriodMonths
//   oldDailyRate  = item.UnitPrice / daysInCycle       (đơn giá đang trả, CHƯA nhân Quantity - xem
//                                                        ghi chú Quantity bên dưới)
//   newDailyRate  = giá gói đích (cùng PeriodMonths) / daysInCycle
//   amountDue     = round((newDailyRate - oldDailyRate) * daysRemaining)
//
// amountDue > 0 (nâng cấp có phụ thu): tạo 1 OrderRequest phụ (Source="plan-change", 1 item duy nhất,
// UnitPrice=amountDue), tái dùng NGUYÊN luồng thanh toán PayOS/webhook/OrderAutoProvisioningBackground
// Service đã có - không cần code thêm gì ở đó. Khi đơn phụ Completed,
// OrderRequestStatusTransitionService.ApplyCompletionEffectsAsync tự áp dụng đổi gói lên item gốc.
// amountDue <= 0 (hạ cấp/ngang giá): đổi NGAY, không qua thanh toán, KHÔNG hoàn phần chênh lệch (quyết
// định phạm vi - không xây Ví/Credit).
//
// Giới hạn đã biết: Quantity > 1 trên 1 dòng không được nhân vào amountDue (đúng theo công thức gốc
// "CurrentUnitPriceOfItem" - đơn giá 1 đơn vị, không phải LineTotal) - giả định thực tế mỗi dòng
// thường là 1 VPS. Addon đang gắn trên item gốc KHÔNG được kiểm tra lại có còn tương thích gói đích
// hay không sau khi đổi (đơn giản hoá phạm vi, khớp quyết định "Addon không grandfathering" ở Phần 4).
public class PlanChangeService : IPlanChangeService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailService _emailService;
    private readonly IAppSettings _appSettings;

    public PlanChangeService(IUnitOfWork unitOfWork, IEmailService emailService, IAppSettings appSettings)
    {
        _unitOfWork = unitOfWork;
        _emailService = emailService;
        _appSettings = appSettings;
    }

    public async Task<PlanChangePreviewDto> PreviewChangeAsync(int itemId, int targetPlanId, Guid customerId, CancellationToken cancellationToken = default)
    {
        var computation = await ValidateAndComputeAsync(itemId, targetPlanId, customerId, cancellationToken);
        return new PlanChangePreviewDto
        {
            TargetPlanName = computation.TargetPlan.Name,
            Direction = computation.IsDowngrade ? "Downgrade" : "Upgrade",
            AmountDue = computation.AmountDue,
            DaysRemaining = computation.DaysRemaining,
            RequiresPayment = computation.AmountDue > 0,
        };
    }

    public async Task<PlanChangeResultDto> RequestChangeAsync(int itemId, int targetPlanId, Guid customerId, CancellationToken cancellationToken = default)
    {
        // Luôn tính lại từ đầu (không tin kết quả Preview trước đó có thể đã cũ - Admin có thể vừa đổi
        // giá/AllowDowngrade/Status giữa lúc khách xem Preview và lúc bấm xác nhận).
        var computation = await ValidateAndComputeAsync(itemId, targetPlanId, customerId, cancellationToken);

        if (computation.AmountDue <= 0)
        {
            var original = computation.Original;
            original.ServicePlanId = computation.TargetPlan.Id;
            original.PlanPriceId = computation.NewPlanPrice.Id;
            original.UnitPrice = computation.NewUnitPrice;
            original.LineTotal = computation.NewUnitPrice * original.Quantity;
            _unitOfWork.Repository<OrderRequestItem, int>().Update(original);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new PlanChangeResultDto { RequiresPayment = false, OrderCode = null, AmountDue = computation.AmountDue };
        }

        var customer = await _unitOfWork.Repository<Customer, Guid>().GetByIdAsync(customerId, cancellationToken)
            ?? throw new NotFoundException(nameof(Customer), customerId);

        var changeItem = new OrderRequestItem
        {
            ServicePlanId = computation.TargetPlan.Id,
            PlanPriceId = computation.NewPlanPrice.Id,
            PeriodMonths = computation.Original.PeriodMonths,
            Quantity = 1,
            UnitPrice = computation.AmountDue,
            LineTotal = computation.AmountDue,
            ChangesFromItemId = computation.Original.Id,
        };

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
            TotalPrice = computation.AmountDue,
            Source = "plan-change",
            CreatedAt = DateTime.UtcNow,
            Items = { changeItem },
        };

        await _unitOfWork.Repository<OrderRequest, int>().AddAsync(orderRequest, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var paymentUrl = $"{_appSettings.PublicBaseUrl}/thanh-toan/{orderRequest.OrderCode}";
        await _emailService.SendAsync(
            customer.Email,
            "Yêu cầu đổi gói dịch vụ - Cloudverse",
            $"Bạn vừa yêu cầu đổi sang gói '{computation.TargetPlan.Name}'. Đơn phụ thu {orderRequest.OrderCode} đang chờ thanh toán, xem hướng dẫn tại: {paymentUrl}",
            cancellationToken);

        return new PlanChangeResultDto { RequiresPayment = true, OrderCode = orderRequest.OrderCode, AmountDue = computation.AmountDue };
    }

    private async Task<PlanChangeComputation> ValidateAndComputeAsync(int itemId, int targetPlanId, Guid customerId, CancellationToken cancellationToken)
    {
        var itemRepository = _unitOfWork.Repository<OrderRequestItem, int>();
        var original = await itemRepository.Query()
            .Include(i => i.OrderRequest)
            .Include(i => i.ServicePlan)
            .FirstOrDefaultAsync(i => i.Id == itemId, cancellationToken);

        // Dùng chung 404 cho "không tồn tại" lẫn "không phải chủ đơn" - mirror
        // OrderRequestService.CreateRenewalAsync (tránh lộ thông tin item của người khác tồn tại).
        if (original is null || original.OrderRequest.CustomerId != customerId)
        {
            throw new NotFoundException(nameof(OrderRequestItem), itemId);
        }

        if (original.ServicePlanId is null || original.ServicePlan is null)
        {
            throw new ValidationException("Chỉ có thể đổi gói cho dịch vụ dạng gói (không áp dụng cho tên miền).");
        }

        // Item gia hạn/đổi gói (RenewsFromItemId/ChangesFromItemId đã có giá trị) là "biên lai", không
        // có vòng đời độc lập - phải thao tác trên item GỐC.
        if (original.RenewsFromItemId is not null || original.ChangesFromItemId is not null)
        {
            throw new ValidationException("Không thể đổi gói từ 1 biên lai gia hạn/đổi gói - vui lòng chọn đúng dịch vụ gốc.");
        }

        if (original.ExpiresAt is null)
        {
            throw new ValidationException("Dịch vụ chưa được bàn giao xong, không thể đổi gói.");
        }

        // Dunning (Phần 8) - dịch vụ đã bị hủy hẳn (dữ liệu bàn giao đã bị xoá) không thể đổi gói.
        if (original.TerminatedAt is not null)
        {
            throw new ValidationException("Dịch vụ đã bị hủy do quá hạn thanh toán quá lâu, vui lòng liên hệ hỗ trợ để được khôi phục.");
        }

        var originalPlan = original.ServicePlan;
        if (originalPlan.PackageType != ServicePlanPackageType.Fixed)
        {
            throw new ValidationException("Chỉ hỗ trợ đổi gói giữa các gói cố định (Fixed).");
        }

        var targetPlan = await _unitOfWork.Repository<ServicePlan, int>().GetByIdAsync(targetPlanId, cancellationToken);
        if (targetPlan is null)
        {
            throw new NotFoundException(nameof(ServicePlan), targetPlanId);
        }

        if (targetPlan.PackageType != ServicePlanPackageType.Fixed)
        {
            throw new ValidationException("Chỉ hỗ trợ đổi gói giữa các gói cố định (Fixed).");
        }

        if (targetPlan.Id == originalPlan.Id)
        {
            throw new ValidationException("Vui lòng chọn 1 gói khác gói hiện tại.");
        }

        if (targetPlan.CategoryId != originalPlan.CategoryId)
        {
            throw new ValidationException("Chỉ có thể đổi sang gói cùng danh mục dịch vụ.");
        }

        if (targetPlan.Status != ServicePlanStatus.Active)
        {
            throw new ValidationException("Gói đích hiện không khả dụng để đổi sang.");
        }

        // Hướng đổi dựa theo DisplayOrder (thứ hạng Admin sắp xếp trong danh mục) - KHÔNG dựa theo dấu
        // của amountDue bên dưới. 2 khái niệm tách biệt có chủ đích: DisplayOrder là hàng rào chính
        // sách (đúng ý đồ xếp hạng của Admin), amountDue là kết quả tài chính thực tế theo giá hiện
        // hành - thường cùng chiều nhưng không bắt buộc (vd Admin đang chạy khuyến mãi tạm thời).
        var isDowngrade = targetPlan.DisplayOrder < originalPlan.DisplayOrder;
        if (isDowngrade && !targetPlan.AllowDowngrade)
        {
            throw new ValidationException("Gói này không cho phép hạ cấp xuống.");
        }

        var now = DateTime.UtcNow;
        var daysRemaining = (original.ExpiresAt.Value - now).Days;
        if (daysRemaining <= 0)
        {
            throw new ValidationException("Dịch vụ đã hết hạn - vui lòng gia hạn trước khi đổi gói.");
        }

        var periodMonths = original.PeriodMonths ?? 1;
        var newPlanPrice = await _unitOfWork.Repository<PlanPrice, int>().Query()
            .FirstOrDefaultAsync(p => p.PlanId == targetPlan.Id && p.IsCurrent && p.IsActive && p.PeriodMonths == periodMonths, cancellationToken);

        if (newPlanPrice is null)
        {
            throw new ValidationException("Gói đích chưa có giá cho đúng kỳ hạn hiện tại của dịch vụ.");
        }

        var daysInCycle = 30 * periodMonths;
        var oldDailyRate = original.UnitPrice / daysInCycle;
        var newUnitPrice = newPlanPrice.PromotionalPrice ?? newPlanPrice.Price;
        var newDailyRate = newUnitPrice / daysInCycle;
        var amountDue = Math.Round((newDailyRate - oldDailyRate) * daysRemaining, 0, MidpointRounding.AwayFromZero);

        return new PlanChangeComputation(original, targetPlan, newPlanPrice, newUnitPrice, amountDue, daysRemaining, isDowngrade);
    }

    private sealed record PlanChangeComputation(
        OrderRequestItem Original,
        ServicePlan TargetPlan,
        PlanPrice NewPlanPrice,
        decimal NewUnitPrice,
        decimal AmountDue,
        int DaysRemaining,
        bool IsDowngrade);
}
