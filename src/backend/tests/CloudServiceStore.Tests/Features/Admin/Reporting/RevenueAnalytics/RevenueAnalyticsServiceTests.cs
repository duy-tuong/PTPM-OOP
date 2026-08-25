using CloudServiceStore.Application.Features.Admin.Reporting.RevenueAnalytics;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;

namespace CloudServiceStore.Tests.Features.Admin.Reporting.RevenueAnalytics;

public class RevenueAnalyticsServiceTests
{
    private static RevenueAnalyticsService CreateSut(AppDbContext context) =>
        new(TestDbContextFactory.CreateUnitOfWork(context));

    // Id block 1101+ - khác HasData (ServiceCategory 1-6, ServicePlan 1-2, PlanPrice 1-4) - test không
    // phụ thuộc InMemory provider có tự nạp seed data hay không.
    private static async Task<(ServiceCategory Category, ServicePlan Plan)> SeedPlanAsync(
        AppDbContext context, int id, string categoryName = "Test Category RA", string? regionId = null)
    {
        var category = new ServiceCategory { Id = id, Name = categoryName, Slug = $"test-cat-ra-{id}", DisplayOrder = 1, IsActive = true };
        var plan = new ServicePlan { Id = id, CategoryId = category.Id, Category = category, Name = $"Plan {id}", Slug = $"plan-ra-{id}", RegionId = regionId };
        context.ServiceCategories.Add(category);
        context.ServicePlans.Add(plan);
        await context.SaveChangesAsync();
        return (category, plan);
    }

    private static OrderRequest BuildOrder(string orderCode, OrderRequestStatus status, DateTime createdAt, Guid? customerId, string source, decimal totalPrice) => new()
    {
        OrderCode = orderCode,
        CustomerId = customerId,
        CustomerType = CustomerType.Individual,
        CustomerName = "RA Test",
        CustomerEmail = "ra-test@example.com",
        CustomerPhone = "0900000000",
        TotalPrice = totalPrice,
        Status = status,
        Source = source,
        CreatedAt = createdAt,
    };

    [Fact]
    public async Task GetSummaryAsync_ComputesMrrAndArrFromActiveItems()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (_, plan) = await SeedPlanAsync(context, 1101);
        var now = DateTime.UtcNow;

        var order = BuildOrder("ORD-RA-1", OrderRequestStatus.Completed, now.AddDays(-10), Guid.NewGuid(), "public-website", 1200000m);
        order.Items.Add(new OrderRequestItem { ServicePlanId = plan.Id, PeriodMonths = 12, Quantity = 1, UnitPrice = 1200000m, LineTotal = 1200000m, ExpiresAt = now.AddDays(300) });
        context.OrderRequests.Add(order);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetSummaryAsync();

        Assert.Equal(100000m, result.Mrr); // 1200000/12
        Assert.Equal(1200000m, result.Arr);
    }

    [Fact]
    public async Task GetSummaryAsync_ExpiredItemExcludedFromMrr()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (_, plan) = await SeedPlanAsync(context, 1102);
        var now = DateTime.UtcNow;

        var order = BuildOrder("ORD-RA-2", OrderRequestStatus.Completed, now.AddDays(-40), Guid.NewGuid(), "public-website", 100000m);
        order.Items.Add(new OrderRequestItem { ServicePlanId = plan.Id, PeriodMonths = 1, Quantity = 1, UnitPrice = 100000m, LineTotal = 100000m, ExpiresAt = now.AddDays(-5) });
        context.OrderRequests.Add(order);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetSummaryAsync();

        Assert.Equal(0m, result.Mrr);
    }

    [Fact]
    public async Task GetSummaryAsync_Arpu_DividesByDistinctActiveCustomers()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (_, plan) = await SeedPlanAsync(context, 1103);
        var now = DateTime.UtcNow;
        var customerA = Guid.NewGuid();
        var customerB = Guid.NewGuid();

        var orderA1 = BuildOrder("ORD-RA-3A1", OrderRequestStatus.Completed, now.AddDays(-5), customerA, "public-website", 100000m);
        orderA1.Items.Add(new OrderRequestItem { ServicePlanId = plan.Id, PeriodMonths = 1, Quantity = 1, UnitPrice = 100000m, LineTotal = 100000m, ExpiresAt = now.AddDays(25) });
        var orderA2 = BuildOrder("ORD-RA-3A2", OrderRequestStatus.Completed, now.AddDays(-5), customerA, "public-website", 100000m);
        orderA2.Items.Add(new OrderRequestItem { ServicePlanId = plan.Id, PeriodMonths = 1, Quantity = 1, UnitPrice = 100000m, LineTotal = 100000m, ExpiresAt = now.AddDays(25) });
        var orderB = BuildOrder("ORD-RA-3B", OrderRequestStatus.Completed, now.AddDays(-5), customerB, "public-website", 100000m);
        orderB.Items.Add(new OrderRequestItem { ServicePlanId = plan.Id, PeriodMonths = 1, Quantity = 1, UnitPrice = 100000m, LineTotal = 100000m, ExpiresAt = now.AddDays(25) });
        context.OrderRequests.AddRange(orderA1, orderA2, orderB);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetSummaryAsync();

        // MRR = 300000 (3 item x 100000/1 tháng), 2 khách riêng biệt -> ARPU = 150000
        Assert.Equal(300000m, result.Mrr);
        Assert.Equal(150000m, result.Arpu);
    }

    [Fact]
    public async Task GetSummaryAsync_NewMrr_OnlyCountsNewPurchasesCreatedThisMonth()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (_, plan) = await SeedPlanAsync(context, 1104);
        var now = DateTime.UtcNow;

        var newOrder = BuildOrder("ORD-RA-4NEW", OrderRequestStatus.Completed, now, Guid.NewGuid(), "public-website", 120000m);
        newOrder.Items.Add(new OrderRequestItem { ServicePlanId = plan.Id, PeriodMonths = 1, Quantity = 1, UnitPrice = 120000m, LineTotal = 120000m, ExpiresAt = now.AddDays(20) });

        var lastMonthOrder = BuildOrder("ORD-RA-4LAST", OrderRequestStatus.Completed, now.AddMonths(-1), Guid.NewGuid(), "public-website", 90000m);
        lastMonthOrder.Items.Add(new OrderRequestItem { ServicePlanId = plan.Id, PeriodMonths = 1, Quantity = 1, UnitPrice = 90000m, LineTotal = 90000m, ExpiresAt = now.AddDays(20) });

        context.OrderRequests.AddRange(newOrder, lastMonthOrder);
        await context.SaveChangesAsync();
        var anchorItem = lastMonthOrder.Items.Single();

        // Đơn gia hạn tạo trong tháng này - KHÔNG tính vào New MRR (chỉ tính mua mới).
        var renewalOrder = BuildOrder("ORD-RA-4RENEWAL", OrderRequestStatus.Completed, now, Guid.NewGuid(), "renewal", 90000m);
        renewalOrder.Items.Add(new OrderRequestItem { ServicePlanId = plan.Id, PeriodMonths = 1, Quantity = 1, UnitPrice = 90000m, LineTotal = 90000m, RenewsFromItemId = anchorItem.Id });
        context.OrderRequests.Add(renewalOrder);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetSummaryAsync();

        Assert.Equal(120000m, result.NewMrr);
    }

    [Fact]
    public async Task GetSummaryAsync_ChurnedMrr_OnlyCountsExpiredItemsWithoutRenewal()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (_, plan) = await SeedPlanAsync(context, 1105);
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var churnedOrder = BuildOrder("ORD-RA-5CHURN", OrderRequestStatus.Completed, monthStart.AddDays(-60), Guid.NewGuid(), "public-website", 150000m);
        churnedOrder.Items.Add(new OrderRequestItem { ServicePlanId = plan.Id, PeriodMonths = 1, Quantity = 1, UnitPrice = 150000m, LineTotal = 150000m, ExpiresAt = monthStart });

        var renewedOrder = BuildOrder("ORD-RA-5RENEWED", OrderRequestStatus.Completed, monthStart.AddDays(-60), Guid.NewGuid(), "public-website", 200000m);
        var renewedItem = new OrderRequestItem { ServicePlanId = plan.Id, PeriodMonths = 1, Quantity = 1, UnitPrice = 200000m, LineTotal = 200000m, ExpiresAt = monthStart };
        renewedOrder.Items.Add(renewedItem);
        context.OrderRequests.AddRange(churnedOrder, renewedOrder);
        await context.SaveChangesAsync();

        var renewalReceiptOrder = BuildOrder("ORD-RA-5RENEWAL-RECEIPT", OrderRequestStatus.Completed, now, Guid.NewGuid(), "renewal", 200000m);
        renewalReceiptOrder.Items.Add(new OrderRequestItem { ServicePlanId = plan.Id, PeriodMonths = 1, Quantity = 1, UnitPrice = 200000m, LineTotal = 200000m, RenewsFromItemId = renewedItem.Id });
        context.OrderRequests.Add(renewalReceiptOrder);
        await context.SaveChangesAsync();

        var sut = CreateSut(context);
        var result = await sut.GetSummaryAsync();

        Assert.Equal(150000m, result.ChurnedMrr);
    }

    [Fact]
    public async Task GetSummaryAsync_Ltv_AveragesTotalRevenuePerCustomer()
    {
        using var context = TestDbContextFactory.CreateContext();
        var now = DateTime.UtcNow;
        var customerA = Guid.NewGuid();
        var customerB = Guid.NewGuid();

        var orderA1 = BuildOrder("ORD-RA-6A1", OrderRequestStatus.Completed, now.AddDays(-30), customerA, "public-website", 100000m);
        var orderA2 = BuildOrder("ORD-RA-6A2", OrderRequestStatus.Completed, now.AddDays(-10), customerA, "renewal", 100000m);
        var orderB = BuildOrder("ORD-RA-6B", OrderRequestStatus.Completed, now.AddDays(-20), customerB, "public-website", 300000m);
        context.OrderRequests.AddRange(orderA1, orderA2, orderB);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetSummaryAsync();

        // Khách A: 100000+100000=200000; Khách B: 300000 -> trung bình (200000+300000)/2=250000
        Assert.Equal(250000m, result.Ltv);
    }

    [Fact]
    public async Task GetTrendAsync_ReturnsRequestedMonthsWithNewMrrBookings()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (_, plan) = await SeedPlanAsync(context, 1107);
        var now = DateTime.UtcNow;

        var order = BuildOrder("ORD-RA-7", OrderRequestStatus.Completed, now, Guid.NewGuid(), "public-website", 60000m);
        order.Items.Add(new OrderRequestItem { ServicePlanId = plan.Id, PeriodMonths = 1, Quantity = 1, UnitPrice = 60000m, LineTotal = 60000m, ExpiresAt = now.AddDays(20) });
        context.OrderRequests.Add(order);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetTrendAsync(3);

        Assert.Equal(3, result.Count);
        var currentMonthLabel = now.ToString("yyyy-MM");
        var currentPoint = Assert.Single(result, p => p.Month == currentMonthLabel);
        Assert.Equal(60000m, currentPoint.NewMrrBookings);
    }

    [Fact]
    public async Task GetRevenueByProductLineAsync_GroupsByCategoryAndTld()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (_, plan) = await SeedPlanAsync(context, 1108, categoryName: "VPS Test RA");
        var now = DateTime.UtcNow;

        var planOrder = BuildOrder("ORD-RA-8PLAN", OrderRequestStatus.Completed, now.AddDays(-5), Guid.NewGuid(), "public-website", 100000m);
        planOrder.Items.Add(new OrderRequestItem { ServicePlanId = plan.Id, PeriodMonths = 1, Quantity = 1, UnitPrice = 100000m, LineTotal = 100000m });

        var tldPricing = new TldPricing { Tld = ".comratest", RegisterPrice = 200000m, RenewPrice = 250000m, TransferPrice = 200000m, IsActive = true };
        context.TldPricings.Add(tldPricing);
        await context.SaveChangesAsync();

        var tldOrder = BuildOrder("ORD-RA-8TLD", OrderRequestStatus.Completed, now.AddDays(-5), Guid.NewGuid(), "public-website", 200000m);
        tldOrder.Items.Add(new OrderRequestItem { TldPricingId = tldPricing.Id, DomainName = "example", Quantity = 1, UnitPrice = 200000m, LineTotal = 200000m });

        context.OrderRequests.AddRange(planOrder, tldOrder);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetRevenueByProductLineAsync();

        Assert.Contains(result, r => r.ProductLine == "VPS Test RA" && r.Revenue == 100000m);
        Assert.Contains(result, r => r.ProductLine == "Tên miền" && r.Revenue == 200000m);
    }

    [Fact]
    public async Task GetRevenueByRegionAsync_GroupsByRegionWithFallbackForUnassigned()
    {
        using var context = TestDbContextFactory.CreateContext();
        var region = new Region { Id = "ra-test-region", Name = "RA Test DC", City = "Test City", CountryCode = "VN" };
        context.Regions.Add(region);
        var (_, planWithRegion) = await SeedPlanAsync(context, 1109, regionId: region.Id);
        var (_, planNoRegion) = await SeedPlanAsync(context, 1110);
        var now = DateTime.UtcNow;

        var orderWithRegion = BuildOrder("ORD-RA-9A", OrderRequestStatus.Completed, now.AddDays(-5), Guid.NewGuid(), "public-website", 100000m);
        orderWithRegion.Items.Add(new OrderRequestItem { ServicePlanId = planWithRegion.Id, PeriodMonths = 1, Quantity = 1, UnitPrice = 100000m, LineTotal = 100000m });
        var orderNoRegion = BuildOrder("ORD-RA-9B", OrderRequestStatus.Completed, now.AddDays(-5), Guid.NewGuid(), "public-website", 50000m);
        orderNoRegion.Items.Add(new OrderRequestItem { ServicePlanId = planNoRegion.Id, PeriodMonths = 1, Quantity = 1, UnitPrice = 50000m, LineTotal = 50000m });

        context.OrderRequests.AddRange(orderWithRegion, orderNoRegion);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetRevenueByRegionAsync();

        Assert.Contains(result, r => r.RegionName == "RA Test DC" && r.Revenue == 100000m);
        Assert.Contains(result, r => r.RegionName == "Không xác định" && r.Revenue == 50000m);
    }

    [Fact]
    public async Task GetArAgingAsync_BucketsUnpaidOrdersByAgeAndExcludesPaidOrders()
    {
        using var context = TestDbContextFactory.CreateContext();
        var now = DateTime.UtcNow;

        var recentUnpaid = BuildOrder("ORD-RA-10A", OrderRequestStatus.New, now.AddDays(-2), null, "public-website", 100000m);
        var midUnpaid = BuildOrder("ORD-RA-10B", OrderRequestStatus.Contacted, now.AddDays(-10), null, "public-website", 200000m);
        var oldUnpaid = BuildOrder("ORD-RA-10C", OrderRequestStatus.Confirmed, now.AddDays(-40), null, "public-website", 300000m);
        var paidOrder = BuildOrder("ORD-RA-10D", OrderRequestStatus.Completed, now.AddDays(-40), null, "public-website", 999999m);

        context.OrderRequests.AddRange(recentUnpaid, midUnpaid, oldUnpaid, paidOrder);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetArAgingAsync();

        Assert.Equal(100000m, result.Single(b => b.BucketLabel == "0-7 ngày").Amount);
        Assert.Equal(200000m, result.Single(b => b.BucketLabel == "8-15 ngày").Amount);
        Assert.Equal(0m, result.Single(b => b.BucketLabel == "16-30 ngày").Amount);
        Assert.Equal(300000m, result.Single(b => b.BucketLabel == "Trên 30 ngày").Amount);
    }
}
