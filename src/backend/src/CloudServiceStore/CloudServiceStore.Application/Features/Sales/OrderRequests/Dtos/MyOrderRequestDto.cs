namespace CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;

// Bản mỏng của AdminOrderRequestDto - bỏ AssignedToUserId/Name và Source (chi tiết nội bộ, khách
// hàng không cần thấy), dùng cho GET /api/order-requests/mine.
public class MyOrderRequestDto
{
    public int Id { get; init; }
    public string OrderCode { get; init; } = string.Empty;
    public string? ServicePlanName { get; init; }
    public string? TldName { get; init; }
    public string? DomainName { get; init; }
    public int? PeriodMonths { get; init; }
    public int Quantity { get; init; }
    public decimal TotalPrice { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}
