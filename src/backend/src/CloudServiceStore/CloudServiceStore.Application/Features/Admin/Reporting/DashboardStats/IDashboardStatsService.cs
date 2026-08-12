using CloudServiceStore.Application.Features.Admin.Reporting.DashboardStats.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Reporting.DashboardStats;

public interface IDashboardStatsService
{
    Task<DashboardStatsDto> GetStatsAsync(CancellationToken cancellationToken = default);
}
