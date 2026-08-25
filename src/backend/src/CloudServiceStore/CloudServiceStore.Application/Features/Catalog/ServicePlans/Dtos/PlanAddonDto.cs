namespace CloudServiceStore.Application.Features.Catalog.ServicePlans.Dtos;

// Addon tương thích với 1 ServicePlan - dùng chung cho cả response Admin (AdminServicePlanDto) và
// public (ServicePlanListItemDto/ServicePlanDetailDto), giống cách PlanFeatureDto/PlanPriceDto đã
// dùng chung. Đủ thông tin để storefront hiển thị + tính giá preview mà không cần gọi thêm API.
public class PlanAddonDto
{
    public int AddonId { get; init; }
    public string AddonName { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string BillingType { get; init; } = string.Empty;
    public string? UnitName { get; init; }
    public decimal PricePerMonth { get; init; }
    public int MaxQuantity { get; init; }
}
