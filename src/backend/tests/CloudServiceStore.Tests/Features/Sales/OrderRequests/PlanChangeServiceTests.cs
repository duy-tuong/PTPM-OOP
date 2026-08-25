using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Sales.OrderRequests;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace CloudServiceStore.Tests.Features.Sales.OrderRequests;

public class PlanChangeServiceTests
{
    private readonly Mock<IEmailService> _emailServiceMock = new();
    private readonly Mock<IAppSettings> _appSettingsMock = new();

    public PlanChangeServiceTests()
    {
        _appSettingsMock.SetupGet(a => a.PublicBaseUrl).Returns("http://localhost:3000");
    }

    private PlanChangeService CreateSut(AppDbContext context) =>
        new(TestDbContextFactory.CreateUnitOfWork(context), _emailServiceMock.Object, _appSettingsMock.Object);

    // Id cố ý khác dữ liệu HasData (ServiceCategory 1-6, ServicePlan 1-2, PlanPrice 1-4) - test không
    // phụ thuộc InMemory provider có tự nạp seed data hay không. Giá chọn chia hết cho 30 (đơn giá/ngày
    // tròn số) để công thức Proration ra số đẹp, dễ verify bằng tay.
    private static async Task<(ServicePlan Original, ServicePlan Target, PlanPrice OriginalPrice, PlanPrice TargetPrice)> SeedPlansAsync(
        AppDbContext context,
        decimal originalPrice = 90000m,
        decimal targetPrice = 300000m,
        int targetDisplayOrder = 2,
        bool targetAllowDowngrade = true,
        ServicePlanStatus targetStatus = ServicePlanStatus.Active,
        int? targetCategoryId = null,
        ServicePlanPackageType originalPackageType = ServicePlanPackageType.Fixed,
        ServicePlanPackageType targetPackageType = ServicePlanPackageType.Fixed,
        int targetPeriodMonths = 1)
    {
        var category = new ServiceCategory { Id = 701, Name = "Test Category PlanChange", Slug = "test-category-planchange", DisplayOrder = 1, IsActive = true };
        var otherCategory = new ServiceCategory { Id = 702, Name = "Other Category PlanChange", Slug = "other-category-planchange", DisplayOrder = 2, IsActive = true };
        context.ServiceCategories.AddRange(category, otherCategory);

        var original = new ServicePlan
        {
            Id = 701, CategoryId = category.Id, Category = category, Name = "Original Plan", Slug = "original-plan-pc",
            Status = ServicePlanStatus.Active, DisplayOrder = 1, PackageType = originalPackageType,
        };
        var target = new ServicePlan
        {
            Id = 702, CategoryId = targetCategoryId ?? category.Id, Category = targetCategoryId is null ? category : otherCategory,
            Name = "Target Plan", Slug = "target-plan-pc", Status = targetStatus, DisplayOrder = targetDisplayOrder,
            PackageType = targetPackageType, AllowDowngrade = targetAllowDowngrade,
        };
        context.ServicePlans.AddRange(original, target);

        var originalPriceRow = new PlanPrice { Id = 701, PlanId = original.Id, PeriodMonths = 1, Price = originalPrice, IsDefault = true, IsActive = true, IsCurrent = true };
        var targetPriceRow = new PlanPrice { Id = 702, PlanId = target.Id, PeriodMonths = targetPeriodMonths, Price = targetPrice, IsDefault = true, IsActive = true, IsCurrent = true };
        context.PlanPrices.AddRange(originalPriceRow, targetPriceRow);

        await context.SaveChangesAsync();
        return (original, target, originalPriceRow, targetPriceRow);
    }

    // roleId tự chọn khác HasData Id 1-3 - cùng lý do SeedPlansAsync ở trên.
    private static async Task<(Customer Customer, OrderRequestItem Item)> SeedLiveItemAsync(
        AppDbContext context, ServicePlan plan, PlanPrice price, DateTime? expiresAt, int roleId,
        int? renewsFromItemId = null, int? changesFromItemId = null)
    {
        context.AppRoles.Add(new AppRole { Id = roleId, Name = $"Test Role {roleId}", Description = "Test" });
        var customer = new Customer
        {
            Id = Guid.NewGuid(), RoleId = roleId, Email = $"pc-{roleId}@example.com", PasswordHash = "hash",
            FullName = "PlanChange Customer", Phone = "0900000003", CustomerType = CustomerType.Individual,
        };
        context.Customers.Add(customer);

        var item = new OrderRequestItem
        {
            ServicePlanId = plan.Id, PlanPriceId = price.Id, PeriodMonths = price.PeriodMonths, Quantity = 1,
            UnitPrice = price.Price, LineTotal = price.Price, ExpiresAt = expiresAt,
            RenewsFromItemId = renewsFromItemId, ChangesFromItemId = changesFromItemId,
        };
        var order = new OrderRequest
        {
            OrderCode = $"ORD-PC-{roleId}", CustomerId = customer.Id, CustomerType = CustomerType.Individual,
            CustomerName = customer.FullName, CustomerEmail = customer.Email, CustomerPhone = customer.Phone!,
            TotalPrice = item.LineTotal, Status = OrderRequestStatus.Completed, CreatedAt = DateTime.UtcNow,
            Items = { item },
        };
        context.OrderRequests.Add(order);
        await context.SaveChangesAsync();
        return (customer, item);
    }

    // Buffer +1h tránh flaky do độ trễ chạy test - (ExpiresAt - now).Days vẫn ra đúng N ngày dù test
    // chạy chậm vài giây/phút, miễn buffer < 24h.
    private static DateTime ExpiresInDays(int days) => DateTime.UtcNow.AddDays(days).AddHours(1);

    [Fact]
    public async Task PreviewChangeAsync_Upgrade_ComputesAmountDueByProrationFormula()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (original, target, originalPrice, _) = await SeedPlansAsync(context);
        var (customer, item) = await SeedLiveItemAsync(context, original, originalPrice, ExpiresInDays(15), roleId: 901);
        var sut = CreateSut(context);

        var result = await sut.PreviewChangeAsync(item.Id, target.Id, customer.Id);

        // oldDaily=90000/30=3000, newDaily=300000/30=10000, diff=7000/ngày * 15 ngày = 105000
        Assert.Equal(105000m, result.AmountDue);
        Assert.Equal("Upgrade", result.Direction);
        Assert.True(result.RequiresPayment);
        Assert.Equal(15, result.DaysRemaining);
    }

    [Fact]
    public async Task PreviewChangeAsync_UpgradeNearCycleStart_ComputesLargerAmountDue()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (original, target, originalPrice, _) = await SeedPlansAsync(context);
        var (customer, item) = await SeedLiveItemAsync(context, original, originalPrice, ExpiresInDays(29), roleId: 902);
        var sut = CreateSut(context);

        var result = await sut.PreviewChangeAsync(item.Id, target.Id, customer.Id);

        // 7000/ngày * 29 ngày = 203000
        Assert.Equal(203000m, result.AmountDue);
    }

    [Fact]
    public async Task PreviewChangeAsync_UpgradeNearCycleEnd_ComputesSmallerAmountDue()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (original, target, originalPrice, _) = await SeedPlansAsync(context);
        var (customer, item) = await SeedLiveItemAsync(context, original, originalPrice, ExpiresInDays(1), roleId: 903);
        var sut = CreateSut(context);

        var result = await sut.PreviewChangeAsync(item.Id, target.Id, customer.Id);

        // 7000/ngày * 1 ngày = 7000
        Assert.Equal(7000m, result.AmountDue);
    }

    [Fact]
    public async Task RequestChangeAsync_Upgrade_CreatesAuxiliaryOrderWithAmountDueAndDoesNotChangeOriginalYet()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (original, target, originalPrice, targetPrice) = await SeedPlansAsync(context);
        var (customer, item) = await SeedLiveItemAsync(context, original, originalPrice, ExpiresInDays(15), roleId: 904);
        var sut = CreateSut(context);

        var result = await sut.RequestChangeAsync(item.Id, target.Id, customer.Id);

        Assert.True(result.RequiresPayment);
        Assert.Equal(105000m, result.AmountDue);
        Assert.NotNull(result.OrderCode);

        var auxOrder = context.OrderRequests.Include(o => o.Items).Single(o => o.OrderCode == result.OrderCode);
        Assert.Equal("plan-change", auxOrder.Source);
        Assert.Equal(105000m, auxOrder.TotalPrice);
        var auxItem = Assert.Single(auxOrder.Items);
        Assert.Equal(target.Id, auxItem.ServicePlanId);
        Assert.Equal(targetPrice.Id, auxItem.PlanPriceId);
        Assert.Equal(item.Id, auxItem.ChangesFromItemId);
        Assert.Equal(105000m, auxItem.UnitPrice);

        // Chưa thanh toán - item gốc chưa bị đổi gói (chỉ đổi khi đơn phụ Completed, xem
        // OrderRequestStatusTransitionServiceTests).
        var reloadedOriginal = context.OrderRequestItems.Single(i => i.Id == item.Id);
        Assert.Equal(original.Id, reloadedOriginal.ServicePlanId);
    }

    [Fact]
    public async Task RequestChangeAsync_Downgrade_AppliesImmediatelyWithoutCreatingOrder()
    {
        using var context = TestDbContextFactory.CreateContext();
        // Target rẻ hơn + DisplayOrder thấp hơn -> hạ cấp.
        var (original, target, originalPrice, targetPrice) = await SeedPlansAsync(context, originalPrice: 90000m, targetPrice: 30000m, targetDisplayOrder: 0);
        var expiresAt = ExpiresInDays(15);
        var (customer, item) = await SeedLiveItemAsync(context, original, originalPrice, expiresAt, roleId: 905);
        var sut = CreateSut(context);

        var ordersBefore = context.OrderRequests.Count(o => o.CustomerId == customer.Id);
        var result = await sut.RequestChangeAsync(item.Id, target.Id, customer.Id);
        var ordersAfter = context.OrderRequests.Count(o => o.CustomerId == customer.Id);

        Assert.False(result.RequiresPayment);
        Assert.Null(result.OrderCode);
        Assert.True(result.AmountDue <= 0);
        Assert.Equal(ordersBefore, ordersAfter);

        var reloadedItem = context.OrderRequestItems.Single(i => i.Id == item.Id);
        Assert.Equal(target.Id, reloadedItem.ServicePlanId);
        Assert.Equal(targetPrice.Id, reloadedItem.PlanPriceId);
        Assert.Equal(30000m, reloadedItem.UnitPrice);
        Assert.Equal(30000m, reloadedItem.LineTotal);
        Assert.Equal(expiresAt, reloadedItem.ExpiresAt);
    }

    [Fact]
    public async Task RequestChangeAsync_DowngradeNotAllowed_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (original, target, originalPrice, _) = await SeedPlansAsync(
            context, originalPrice: 90000m, targetPrice: 30000m, targetDisplayOrder: 0, targetAllowDowngrade: false);
        var (customer, item) = await SeedLiveItemAsync(context, original, originalPrice, ExpiresInDays(15), roleId: 906);
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ValidationException>(() => sut.RequestChangeAsync(item.Id, target.Id, customer.Id));
    }

    [Fact]
    public async Task PreviewChangeAsync_DifferentCategory_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (original, target, originalPrice, _) = await SeedPlansAsync(context, targetCategoryId: 702);
        var (customer, item) = await SeedLiveItemAsync(context, original, originalPrice, ExpiresInDays(15), roleId: 907);
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ValidationException>(() => sut.PreviewChangeAsync(item.Id, target.Id, customer.Id));
    }

    [Fact]
    public async Task PreviewChangeAsync_ExpiredItem_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (original, target, originalPrice, _) = await SeedPlansAsync(context);
        var (customer, item) = await SeedLiveItemAsync(context, original, originalPrice, DateTime.UtcNow.AddDays(-1), roleId: 908);
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ValidationException>(() => sut.PreviewChangeAsync(item.Id, target.Id, customer.Id));
    }

    // Dunning (Đợt 2, Phần 8) - dịch vụ đã bị hủy hẳn (dữ liệu bàn giao đã bị xoá) không thể đổi gói.
    [Fact]
    public async Task PreviewChangeAsync_TerminatedItem_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (original, target, originalPrice, _) = await SeedPlansAsync(context);
        var (customer, item) = await SeedLiveItemAsync(context, original, originalPrice, ExpiresInDays(15), roleId: 917);
        item.TerminatedAt = DateTime.UtcNow.AddDays(-1);
        context.OrderRequestItems.Update(item);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ValidationException>(() => sut.PreviewChangeAsync(item.Id, target.Id, customer.Id));
    }

    [Fact]
    public async Task PreviewChangeAsync_NotYetProvisioned_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (original, target, originalPrice, _) = await SeedPlansAsync(context);
        var (customer, item) = await SeedLiveItemAsync(context, original, originalPrice, expiresAt: null, roleId: 909);
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ValidationException>(() => sut.PreviewChangeAsync(item.Id, target.Id, customer.Id));
    }

    [Fact]
    public async Task PreviewChangeAsync_ItemNotFound_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<NotFoundException>(() => sut.PreviewChangeAsync(9999, 1, Guid.NewGuid()));
    }

    [Fact]
    public async Task PreviewChangeAsync_NotOwner_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (original, target, originalPrice, _) = await SeedPlansAsync(context);
        var (_, item) = await SeedLiveItemAsync(context, original, originalPrice, ExpiresInDays(15), roleId: 910);
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<NotFoundException>(() => sut.PreviewChangeAsync(item.Id, target.Id, Guid.NewGuid()));
    }

    [Fact]
    public async Task PreviewChangeAsync_OriginalPlanIsCustomPackage_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (original, target, originalPrice, _) = await SeedPlansAsync(context, originalPackageType: ServicePlanPackageType.Custom);
        var (customer, item) = await SeedLiveItemAsync(context, original, originalPrice, ExpiresInDays(15), roleId: 911);
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ValidationException>(() => sut.PreviewChangeAsync(item.Id, target.Id, customer.Id));
    }

    [Fact]
    public async Task PreviewChangeAsync_TargetPlanIsCustomPackage_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (original, target, originalPrice, _) = await SeedPlansAsync(context, targetPackageType: ServicePlanPackageType.Custom);
        var (customer, item) = await SeedLiveItemAsync(context, original, originalPrice, ExpiresInDays(15), roleId: 912);
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ValidationException>(() => sut.PreviewChangeAsync(item.Id, target.Id, customer.Id));
    }

    [Fact]
    public async Task PreviewChangeAsync_TargetPlanNotActive_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (original, target, originalPrice, _) = await SeedPlansAsync(context, targetStatus: ServicePlanStatus.Draft);
        var (customer, item) = await SeedLiveItemAsync(context, original, originalPrice, ExpiresInDays(15), roleId: 913);
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ValidationException>(() => sut.PreviewChangeAsync(item.Id, target.Id, customer.Id));
    }

    [Fact]
    public async Task PreviewChangeAsync_TargetPlanMissingPriceForCurrentPeriod_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        // Item gốc PeriodMonths=1 nhưng gói đích chỉ có giá cho 12 tháng.
        var (original, target, originalPrice, _) = await SeedPlansAsync(context, targetPeriodMonths: 12);
        var (customer, item) = await SeedLiveItemAsync(context, original, originalPrice, ExpiresInDays(15), roleId: 914);
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ValidationException>(() => sut.PreviewChangeAsync(item.Id, target.Id, customer.Id));
    }

    [Fact]
    public async Task PreviewChangeAsync_SamePlanAsTarget_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (original, _, originalPrice, _) = await SeedPlansAsync(context);
        var (customer, item) = await SeedLiveItemAsync(context, original, originalPrice, ExpiresInDays(15), roleId: 915);
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ValidationException>(() => sut.PreviewChangeAsync(item.Id, original.Id, customer.Id));
    }

    [Fact]
    public async Task PreviewChangeAsync_FromChangeReceiptItem_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (original, target, originalPrice, _) = await SeedPlansAsync(context);
        var (customer, rootItem) = await SeedLiveItemAsync(context, original, originalPrice, ExpiresInDays(15), roleId: 916);

        // Biên lai đổi gói CÙNG khách hàng - thêm trực tiếp (không qua SeedLiveItemAsync, hàm đó luôn
        // tạo khách hàng mới) để giữ đúng chủ sở hữu, chỉ khác test-case do ChangesFromItemId đã có giá trị.
        var receiptItem = new OrderRequestItem
        {
            ServicePlanId = target.Id, PlanPriceId = originalPrice.Id, PeriodMonths = 1, Quantity = 1,
            UnitPrice = 1000m, LineTotal = 1000m, ChangesFromItemId = rootItem.Id,
        };
        context.OrderRequests.Add(new OrderRequest
        {
            OrderCode = "ORD-PC-RECEIPT-916", CustomerId = customer.Id, CustomerType = CustomerType.Individual,
            CustomerName = customer.FullName, CustomerEmail = customer.Email, CustomerPhone = customer.Phone!,
            TotalPrice = 1000m, Status = OrderRequestStatus.Completed, CreatedAt = DateTime.UtcNow,
            Items = { receiptItem },
        });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ValidationException>(() => sut.PreviewChangeAsync(receiptItem.Id, original.Id, customer.Id));
    }
}
