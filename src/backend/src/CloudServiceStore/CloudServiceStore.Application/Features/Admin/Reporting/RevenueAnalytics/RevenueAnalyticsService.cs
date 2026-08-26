using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Admin.Reporting.RevenueAnalytics.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Reporting.RevenueAnalytics;

// Phần "Kinh doanh" Đợt 2 - Revenue Analytics (Phần 7). Toàn bộ số liệu tính TRỰC TIẾP từ
// OrderRequest/OrderRequestItem/PlanPrice đã có sẵn - KHÔNG cần entity/migration mới, KHÔNG cần tích
// hợp gì thêm (khác các phần Dunning/Fraud/CRM sau đó).
//
// Định nghĩa MRR/ARR quy đổi cho mô hình "mua theo kỳ hạn cố định" (không phải subscription tính tiền
// hàng tháng thật): mỗi OrderRequestItem đang sống (Order Completed, ExpiresAt > now) đóng góp
// UnitPrice/PeriodMonths vào MRR - xem GetSummaryAsync.
public class RevenueAnalyticsService : IRevenueAnalyticsService
{
    private readonly IUnitOfWork _unitOfWork;

    public RevenueAnalyticsService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<RevenueAnalyticsSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var itemRepository = _unitOfWork.Repository<OrderRequestItem, int>();

        var activeItems = await itemRepository.Query()
            .Where(i => i.ServicePlanId != null
                && i.OrderRequest.Status == OrderRequestStatus.Completed
                && i.ExpiresAt != null && i.ExpiresAt > now
                && i.PeriodMonths != null && i.PeriodMonths > 0)
            .Select(i => new { i.UnitPrice, PeriodMonths = i.PeriodMonths!.Value, i.OrderRequest.CustomerId })
            .ToListAsync(cancellationToken);

        var mrr = activeItems.Sum(i => i.UnitPrice / i.PeriodMonths);
        var arr = mrr * 12;
        var activeCustomerCount = activeItems.Select(i => i.CustomerId).Where(id => id != null).Distinct().Count();
        var arpu = activeCustomerCount > 0 ? mrr / activeCustomerCount : 0m;

        var newMrr = await ComputeNewMrrAsync(itemRepository, monthStart, now, cancellationToken);
        var churnedMrr = await ComputeChurnedMrrAsync(itemRepository, monthStart, now, cancellationToken);

        // Churn Rate: item hết hạn trong tháng không có item gia hạn / item đang active vào đầu tháng
        // (ước lượng: đã tồn tại trước đầu tháng và còn hạn tới ít nhất đầu tháng).
        var activeAtMonthStart = await itemRepository.Query()
            .CountAsync(i => i.ServicePlanId != null
                && i.OrderRequest.Status == OrderRequestStatus.Completed
                && i.ExpiresAt != null && i.ExpiresAt >= monthStart
                && i.OrderRequest.CreatedAt < monthStart, cancellationToken);

        var itemsQuery = itemRepository.Query();
        var expiredWithoutRenewalCount = await itemsQuery
            .Where(i => i.ServicePlanId != null
                && i.OrderRequest.Status == OrderRequestStatus.Completed
                && i.ExpiresAt != null && i.ExpiresAt >= monthStart && i.ExpiresAt <= now
                && !itemsQuery.Any(r => r.RenewsFromItemId == i.Id))
            .CountAsync(cancellationToken);

        var churnRatePercent = activeAtMonthStart > 0
            ? Math.Round((decimal)expiredWithoutRenewalCount / activeAtMonthStart * 100, 2)
            : 0m;

        var orderRepository = _unitOfWork.Repository<OrderRequest, int>();
        var customerLifetimeTotals = await orderRepository.Query()
            .Where(o => o.Status == OrderRequestStatus.Completed && o.CustomerId != null)
            .GroupBy(o => o.CustomerId)
            .Select(g => g.Sum(o => o.TotalPrice))
            .ToListAsync(cancellationToken);
        var ltv = customerLifetimeTotals.Count > 0 ? customerLifetimeTotals.Average() : 0m;

        return new RevenueAnalyticsSummaryDto
        {
            Mrr = mrr,
            Arr = arr,
            NewMrr = newMrr,
            ChurnedMrr = churnedMrr,
            NetNewMrr = newMrr - churnedMrr,
            Arpu = arpu,
            ChurnRatePercent = churnRatePercent,
            Ltv = ltv
        };
    }

    // "New MRR bookings" theo từng tháng trong N tháng gần nhất - đơn giản hoá: tổng MRR quy đổi của
    // các đơn MUA MỚI hoàn tất trong tháng đó (không tính gia hạn/đổi gói), KHÔNG dựng lại MRR đang
    // sống theo từng ngày trong quá khứ (cần snapshot lịch sử không có sẵn) - dùng làm proxy tăng
    // trưởng bookings, ghi rõ trong MrrTrendPointDto.
    public async Task<List<MrrTrendPointDto>> GetTrendAsync(int months, CancellationToken cancellationToken = default)
    {
        var itemRepository = _unitOfWork.Repository<OrderRequestItem, int>();
        var now = DateTime.UtcNow;
        var result = new List<MrrTrendPointDto>();

        for (var i = months - 1; i >= 0; i--)
        {
            var monthDate = now.AddMonths(-i);
            var start = new DateTime(monthDate.Year, monthDate.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var end = start.AddMonths(1);

            var newMrr = await ComputeNewMrrAsync(itemRepository, start, end, cancellationToken);
            result.Add(new MrrTrendPointDto { Month = start.ToString("yyyy-MM"), NewMrrBookings = newMrr });
        }

        return result;
    }

    // Tránh JOIN qua navigation ServicePlan/Category (2 entity đều có global query filter !IsDeleted) -
    // mirror đúng kỹ thuật DashboardStatsService.BuildTopServicePlansAsync: lấy Id/LineTotal thô, tra
    // tên riêng với IgnoreQueryFilters() rồi gộp ở phía ứng dụng - tránh mất doanh thu lịch sử nếu
    // Admin xoá mềm 1 gói/danh mục đã từng bán.
    public async Task<List<RevenueByProductLineDto>> GetRevenueByProductLineAsync(CancellationToken cancellationToken = default)
    {
        var itemRepository = _unitOfWork.Repository<OrderRequestItem, int>();

        var planLines = await itemRepository.Query()
            .Where(i => i.ServicePlanId != null && i.OrderRequest.Status == OrderRequestStatus.Completed)
            .Select(i => new { PlanId = i.ServicePlanId!.Value, i.LineTotal })
            .ToListAsync(cancellationToken);

        var planIds = planLines.Select(p => p.PlanId).Distinct().ToList();
        var planCategoryIds = await _unitOfWork.Repository<ServicePlan, int>().Query()
            .IgnoreQueryFilters()
            .Where(p => planIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p.CategoryId, cancellationToken);

        var categoryIds = planCategoryIds.Values.Distinct().ToList();
        var categoryNames = await _unitOfWork.Repository<ServiceCategory, int>().Query()
            .IgnoreQueryFilters()
            .Where(c => categoryIds.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, c => c.Name, cancellationToken);

        var byCategory = planLines
            .GroupBy(p => planCategoryIds.TryGetValue(p.PlanId, out var catId) && categoryNames.TryGetValue(catId, out var name)
                ? name
                : "(Danh mục đã xoá)")
            .Select(g => new RevenueByProductLineDto { ProductLine = g.Key, Revenue = g.Sum(x => x.LineTotal) })
            .ToList();

        var tldRevenue = await itemRepository.Query()
            .Where(i => i.TldPricingId != null && i.OrderRequest.Status == OrderRequestStatus.Completed)
            .SumAsync(i => (decimal?)i.LineTotal, cancellationToken) ?? 0m;

        if (tldRevenue > 0)
        {
            byCategory.Add(new RevenueByProductLineDto { ProductLine = "Tên miền", Revenue = tldRevenue });
        }

        return byCategory.OrderByDescending(r => r.Revenue).ToList();
    }

    public async Task<List<RevenueByRegionDto>> GetRevenueByRegionAsync(CancellationToken cancellationToken = default)
    {
        var itemRepository = _unitOfWork.Repository<OrderRequestItem, int>();

        var planLines = await itemRepository.Query()
            .Where(i => i.ServicePlanId != null && i.OrderRequest.Status == OrderRequestStatus.Completed)
            .Select(i => new { PlanId = i.ServicePlanId!.Value, i.LineTotal })
            .ToListAsync(cancellationToken);

        var planIds = planLines.Select(p => p.PlanId).Distinct().ToList();
        var planRegionIds = await _unitOfWork.Repository<ServicePlan, int>().Query()
            .IgnoreQueryFilters()
            .Where(p => planIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p.RegionId, cancellationToken);

        var regionIds = planRegionIds.Values.Where(id => id != null).Select(id => id!).Distinct().ToList();
        var regionNames = await _unitOfWork.Repository<Region, string>().Query()
            .Where(r => regionIds.Contains(r.Id))
            .ToDictionaryAsync(r => r.Id, r => r.Name, cancellationToken);

        return planLines
            .GroupBy(p => planRegionIds.TryGetValue(p.PlanId, out var regionId) && regionId != null && regionNames.TryGetValue(regionId, out var name)
                ? name
                : "Không xác định")
            .Select(g => new RevenueByRegionDto { RegionName = g.Key, Revenue = g.Sum(x => x.LineTotal) })
            .OrderByDescending(r => r.Revenue)
            .ToList();
    }

    public async Task<List<ArAgingBucketDto>> GetArAgingAsync(CancellationToken cancellationToken = default)
    {
        var orderRepository = _unitOfWork.Repository<OrderRequest, int>();
        var now = DateTime.UtcNow;

        var unpaidOrders = await orderRepository.Query()
            .Where(o => o.Status == OrderRequestStatus.New
                || o.Status == OrderRequestStatus.Contacted
                || o.Status == OrderRequestStatus.Confirmed)
            .Select(o => new { o.TotalPrice, o.CreatedAt })
            .ToListAsync(cancellationToken);

        var buckets = new (string Label, int MinDays, int MaxDays)[]
        {
            ("0-7 ngày", 0, 7),
            ("8-15 ngày", 8, 15),
            ("16-30 ngày", 16, 30),
            ("Trên 30 ngày", 31, int.MaxValue),
        };

        return buckets.Select(b =>
        {
            var matched = unpaidOrders.Where(o =>
            {
                var ageDays = (now - o.CreatedAt).Days;
                return ageDays >= b.MinDays && ageDays <= b.MaxDays;
            }).ToList();

            return new ArAgingBucketDto
            {
                BucketLabel = b.Label,
                Amount = matched.Sum(o => o.TotalPrice),
                OrderCount = matched.Count
            };
        }).ToList();
    }

    private static async Task<decimal> ComputeNewMrrAsync(
        IRepository<OrderRequestItem, int> itemRepository, DateTime rangeStart, DateTime rangeEnd, CancellationToken cancellationToken)
    {
        var items = await itemRepository.Query()
            .Where(i => i.ServicePlanId != null
                && i.RenewsFromItemId == null && i.ChangesFromItemId == null
                && i.OrderRequest.Status == OrderRequestStatus.Completed
                && i.OrderRequest.Source == "public-website"
                && i.OrderRequest.CreatedAt >= rangeStart && i.OrderRequest.CreatedAt < rangeEnd
                && i.PeriodMonths != null && i.PeriodMonths > 0)
            .Select(i => new { i.UnitPrice, PeriodMonths = i.PeriodMonths!.Value })
            .ToListAsync(cancellationToken);

        return items.Sum(i => i.UnitPrice / i.PeriodMonths);
    }

    private static async Task<decimal> ComputeChurnedMrrAsync(
        IRepository<OrderRequestItem, int> itemRepository, DateTime monthStart, DateTime now, CancellationToken cancellationToken)
    {
        var itemsQuery = itemRepository.Query();
        var churned = await itemsQuery
            .Where(i => i.ServicePlanId != null
                && i.OrderRequest.Status == OrderRequestStatus.Completed
                && i.ExpiresAt != null && i.ExpiresAt >= monthStart && i.ExpiresAt <= now
                && i.PeriodMonths != null && i.PeriodMonths > 0
                && !itemsQuery.Any(r => r.RenewsFromItemId == i.Id))
            .Select(i => new { i.UnitPrice, PeriodMonths = i.PeriodMonths!.Value })
            .ToListAsync(cancellationToken);

        return churned.Sum(i => i.UnitPrice / i.PeriodMonths);
    }
}
