namespace CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;

// Xem trước kết quả đổi gói TRƯỚC khi khách xác nhận - PreviewChangeAsync tính toán y hệt
// RequestChangeAsync (dùng chung PlanChangeService.ValidateAndComputeAsync) nhưng không ghi gì xuống
// DB, chỉ để hiển thị số tiền phải trả thêm/không hoàn cho khách xác nhận trước.
public class PlanChangePreviewDto
{
    public string TargetPlanName { get; init; } = string.Empty;
    // "Upgrade" | "Downgrade" - dựa theo so sánh DisplayOrder giữa 2 gói (xem PlanChangeService),
    // KHÔNG phải dấu của AmountDue (2 khái niệm tách biệt, xem ghi chú trong PlanChangeService).
    public string Direction { get; init; } = string.Empty;
    // > 0: khách phải trả thêm (nâng cấp có phụ thu, cần thanh toán qua PayOS). <= 0: đổi ngay không
    // mất thêm tiền, KHÔNG hoàn phần chênh lệch (quyết định phạm vi, xem PlanChangeService).
    public decimal AmountDue { get; init; }
    public int DaysRemaining { get; init; }
    public bool RequiresPayment { get; init; }
}
