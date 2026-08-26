namespace CloudServiceStore.Application.Features.Catalog.ServicePlans.Dtos;

// Hệ điều hành khả dụng cho 1 ServicePlan (Đợt 3, Phần 11) - dùng chung cho cả response Admin
// (AdminServicePlanDto) và public (ServicePlanListItemDto/ServicePlanDetailDto), mirror PlanAddonDto.
public class PlanOsImageDto
{
    public int OsImageId { get; init; }
    public string OsImageName { get; init; } = string.Empty;
    public string Family { get; init; } = string.Empty;
    public decimal? WindowsLicenseFeePerMonth { get; init; }
    public bool IsDefault { get; init; }
}
