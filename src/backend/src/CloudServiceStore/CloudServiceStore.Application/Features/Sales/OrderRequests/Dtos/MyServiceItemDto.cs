namespace CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;

// Tier 4 "vòng đời gia hạn" - dùng cho GET /order-requests/mine/services. Khác MyOrderRequestDto: đây
// là "dịch vụ đang sống" theo TỪNG DÒNG (item), không gộp theo đơn - 1 đơn nhiều dòng sẽ tách thành
// nhiều dòng dịch vụ riêng ở đây, mỗi dòng có ExpiresAt/thông tin bàn giao độc lập.
public class MyServiceItemDto
{
    public int ItemId { get; init; }
    public string OrderCode { get; init; } = string.Empty;
    public string OrderStatus { get; init; } = string.Empty;
    public int? ServicePlanId { get; init; }
    public string? ServicePlanName { get; init; }
    // Chỉ có ý nghĩa khi ServicePlanId != null - client dùng để: (1) ẩn nút "Đổi gói" khi Custom (Phần
    // 6 chỉ hỗ trợ đổi giữa 2 gói Fixed), (2) fetch danh sách gói cùng danh mục làm gói đích.
    public string? ServicePlanCategorySlug { get; init; }
    public string? ServicePlanPackageType { get; init; }
    public string? DomainName { get; init; }
    public string? TldName { get; init; }
    public int? PeriodMonths { get; init; }
    public DateTime? ExpiresAt { get; init; }
    public string? ProvisionedIpAddress { get; init; }
    public string? ProvisionedRootPassword { get; init; }
    public string? ProvisionedNameservers { get; init; }
}
