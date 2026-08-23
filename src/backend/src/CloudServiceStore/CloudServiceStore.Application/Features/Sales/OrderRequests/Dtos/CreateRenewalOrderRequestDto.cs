namespace CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;

// Gia hạn 1 dịch vụ đã mua (Tier 4) - tạo 1 OrderRequest mới đi lại toàn bộ chu trình thanh toán +
// cấp phát tự động có sẵn (Tier 1-3, khách vẫn "chuyển khoản" giả lập ở /thanh-toan/{orderCode}), chỉ
// khác lúc Completed là gia hạn ExpiresAt của item GỐC thay vì sinh thông tin bàn giao mới (xem
// OrderRequestStatusTransitionService.ApplyCompletionEffectsAsync).
public class CreateRenewalOrderRequestDto
{
    public int OrderRequestItemId { get; set; } // item GỐC cần gia hạn

    public int? PeriodMonths { get; set; } // item gói dịch vụ - mặc định = kỳ hạn cũ nếu bỏ trống

    public int? Years { get; set; } // item tên miền - mặc định = số năm cũ (Quantity) nếu bỏ trống
}
