namespace CloudServiceStore.Application.Features.Admin.Reporting.DashboardStats.Dtos;

public class TopServicePlanStatDto
{
    public int ServicePlanId { get; init; }
    public string ServicePlanName { get; init; } = string.Empty;
    public int RequestCount { get; init; }
}
