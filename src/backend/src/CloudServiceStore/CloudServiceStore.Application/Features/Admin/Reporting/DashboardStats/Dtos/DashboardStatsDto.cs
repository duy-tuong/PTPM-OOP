namespace CloudServiceStore.Application.Features.Admin.Reporting.DashboardStats.Dtos;

public class DashboardStatsDto
{
    public int TotalOrderRequests { get; init; }
    public int TotalConsultationRequests { get; init; }
    public int TotalAffiliateApplications { get; init; }
    public int PendingOrderRequests { get; init; }
    public List<MonthlyRequestStatDto> MonthlyStats { get; init; } = new();
    public List<TopServicePlanStatDto> TopServicePlans { get; init; } = new();
}
