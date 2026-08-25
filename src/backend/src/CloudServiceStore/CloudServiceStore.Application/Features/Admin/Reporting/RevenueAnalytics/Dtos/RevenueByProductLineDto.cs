namespace CloudServiceStore.Application.Features.Admin.Reporting.RevenueAnalytics.Dtos;

public class RevenueByProductLineDto
{
    public string ProductLine { get; init; } = string.Empty;
    public decimal Revenue { get; init; }
}
