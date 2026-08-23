using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Admin.Reporting.DashboardStats.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Reporting.DashboardStats;

public class DashboardStatsService : IDashboardStatsService
{
    private const int MonthsToShow = 6;

    private readonly IUnitOfWork _unitOfWork;

    public DashboardStatsService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<DashboardStatsDto> GetStatsAsync(CancellationToken cancellationToken = default)
    {
        var orderRepository = _unitOfWork.Repository<OrderRequest, int>();
        var consultationRepository = _unitOfWork.Repository<ConsultationRequest, int>();
        var affiliateRepository = _unitOfWork.Repository<AffiliateApplication, int>();
        var planRepository = _unitOfWork.Repository<ServicePlan, int>();

        var totalOrderRequests = await orderRepository.Query().CountAsync(cancellationToken);
        var totalConsultationRequests = await consultationRepository.Query().CountAsync(cancellationToken);
        var totalAffiliateApplications = await affiliateRepository.Query().CountAsync(cancellationToken);
        var pendingOrderRequests = await orderRepository.Query()
            .CountAsync(o => o.Status == OrderRequestStatus.New, cancellationToken);

        var monthlyStats = await BuildMonthlyStatsAsync(orderRepository, consultationRepository, cancellationToken);
        var orderItemRepository = _unitOfWork.Repository<OrderRequestItem, int>();
        var topServicePlans = await BuildTopServicePlansAsync(orderItemRepository, planRepository, cancellationToken);

        return new DashboardStatsDto
        {
            TotalOrderRequests = totalOrderRequests,
            TotalConsultationRequests = totalConsultationRequests,
            TotalAffiliateApplications = totalAffiliateApplications,
            PendingOrderRequests = pendingOrderRequests,
            MonthlyStats = monthlyStats,
            TopServicePlans = topServicePlans
        };
    }

    // "số yêu cầu theo tháng" (mục 3.2.6 đề bài) — gộp OrderRequest + ConsultationRequest theo
    // tháng tạo, lấy 6 tháng gần nhất (kể cả tháng không có yêu cầu nào, hiển thị 0).
    private static async Task<List<MonthlyRequestStatDto>> BuildMonthlyStatsAsync(
        IRepository<OrderRequest, int> orderRepository,
        IRepository<ConsultationRequest, int> consultationRepository,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var sinceMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-(MonthsToShow - 1));

        var orderGroups = await orderRepository.Query()
            .Where(o => o.CreatedAt >= sinceMonth)
            .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var consultationGroups = await consultationRepository.Query()
            .Where(c => c.CreatedAt >= sinceMonth)
            .GroupBy(c => new { c.CreatedAt.Year, c.CreatedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var monthlyStats = new List<MonthlyRequestStatDto>();
        for (var i = MonthsToShow - 1; i >= 0; i--)
        {
            var month = now.AddMonths(-i);
            monthlyStats.Add(new MonthlyRequestStatDto
            {
                Month = month.ToString("yyyy-MM"),
                OrderRequestCount = orderGroups.FirstOrDefault(g => g.Year == month.Year && g.Month == month.Month)?.Count ?? 0,
                ConsultationRequestCount = consultationGroups.FirstOrDefault(g => g.Year == month.Year && g.Month == month.Month)?.Count ?? 0
            });
        }

        return monthlyStats;
    }

    // "gói dịch vụ được quan tâm nhất" (mục 3.2.6 đề bài) — top 5 ServicePlan theo số dòng OrderRequestItem
    // (đơn nhiều dòng nên đếm theo dòng, không theo đơn - 1 đơn có thể có nhiều dòng cùng 1 gói).
    private static async Task<List<TopServicePlanStatDto>> BuildTopServicePlansAsync(
        IRepository<OrderRequestItem, int> orderItemRepository,
        IRepository<ServicePlan, int> planRepository,
        CancellationToken cancellationToken)
    {
        var topPlanGroups = await orderItemRepository.Query()
            .Where(i => i.ServicePlanId != null)
            .GroupBy(i => i.ServicePlanId)
            .Select(g => new { ServicePlanId = g.Key!.Value, Count = g.Count() })
            .OrderByDescending(g => g.Count)
            .Take(5)
            .ToListAsync(cancellationToken);

        var planIds = topPlanGroups.Select(g => g.ServicePlanId).ToList();
        var planNames = await planRepository.Query()
            .Where(p => planIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p.Name, cancellationToken);

        return topPlanGroups
            .Select(g => new TopServicePlanStatDto
            {
                ServicePlanId = g.ServicePlanId,
                ServicePlanName = planNames.TryGetValue(g.ServicePlanId, out var name) ? name : "(đã xoá)",
                RequestCount = g.Count
            })
            .ToList();
    }
}
