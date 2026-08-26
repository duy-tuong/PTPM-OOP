namespace CloudServiceStore.Application.Features.Admin.Reporting.RevenueAnalytics.Dtos;

public class RevenueByRegionDto
{
    public string RegionName { get; init; } = string.Empty;
    public decimal Revenue { get; init; }
}
