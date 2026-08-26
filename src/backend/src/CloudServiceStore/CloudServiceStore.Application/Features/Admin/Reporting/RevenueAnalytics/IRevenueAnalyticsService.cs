using CloudServiceStore.Application.Features.Admin.Reporting.RevenueAnalytics.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Reporting.RevenueAnalytics;

public interface IRevenueAnalyticsService
{
    Task<RevenueAnalyticsSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default);

    Task<List<MrrTrendPointDto>> GetTrendAsync(int months, CancellationToken cancellationToken = default);

    Task<List<RevenueByProductLineDto>> GetRevenueByProductLineAsync(CancellationToken cancellationToken = default);

    Task<List<RevenueByRegionDto>> GetRevenueByRegionAsync(CancellationToken cancellationToken = default);

    Task<List<ArAgingBucketDto>> GetArAgingAsync(CancellationToken cancellationToken = default);
}
