namespace CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;

// Tier 4 "vòng đời gia hạn" - dùng cho GET /order-requests/mine/services. Khác MyOrderRequestDto: đây
// là "dịch vụ đang sống" theo TỪNG DÒNG (item), không gộp theo đơn - 1 đơn nhiều dòng sẽ tách thành
// nhiều dòng dịch vụ riêng ở đây, mỗi dòng có ExpiresAt/thông tin bàn giao độc lập.
public class MyServiceItemDto
{
    public int ItemId { get; init; }
    public string OrderCode { get; init; } = string.Empty;
    public string OrderStatus { get; init; } = string.Empty;
    public string? ServicePlanName { get; init; }
    public string? DomainName { get; init; }
    public string? TldName { get; init; }
    public int? PeriodMonths { get; init; }
    public DateTime? ExpiresAt { get; init; }
    public string? ProvisionedIpAddress { get; init; }
    public string? ProvisionedRootPassword { get; init; }
    public string? ProvisionedNameservers { get; init; }
}
