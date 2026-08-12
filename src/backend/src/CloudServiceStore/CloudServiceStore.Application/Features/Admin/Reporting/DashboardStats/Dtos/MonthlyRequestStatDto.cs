namespace CloudServiceStore.Application.Features.Admin.Reporting.DashboardStats.Dtos;

public class MonthlyRequestStatDto
{
    public string Month { get; init; } = string.Empty; // "yyyy-MM"
    public int OrderRequestCount { get; init; }
    public int ConsultationRequestCount { get; init; }
}
