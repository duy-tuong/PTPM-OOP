using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Services;
using CloudServiceStore.Application.Features.Sales.OrderRequests;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;
using Moq;

namespace CloudServiceStore.Tests.Features.Sales.OrderRequests;

public class OrderRequestStatusTransitionServiceTests
{
    private static async Task<OrderRequest> SeedOrderRequestAsync(
        AppDbContext context,
        OrderRequestStatus status = OrderRequestStatus.New,
        Guid? assignedToUserId = null,
        bool useTldItem = false)
    {
        var item = useTldItem
            ? new OrderRequestItem { TldPricingId = 1, DomainName = "example", Quantity = 1, UnitPrice = 250000m, LineTotal = 250000m }
            : new OrderRequestItem { ServicePlanId = 1, Quantity = 1, UnitPrice = 100000m, LineTotal = 100000m };

        var order = new OrderRequest
        {
            OrderCode = "ORD-TEST-001",
            CustomerType = CustomerType.Individual,
            CustomerName = "Test Customer",
            CustomerEmail = "test@example.com",
            CustomerPhone = "0900000000",
            TotalPrice = 100000m,
            Status = status,
            AssignedToUserId = assignedToUserId,
            CreatedAt = DateTime.UtcNow,
            Items = { item }
        };
        context.OrderRequests.Add(order);
        await context.SaveChangesAsync();
        return order;
    }

    // Kịch bản gia hạn (Tier 4): 1 item GỐC "đang sống" (đơn riêng, đã Completed từ trước, có thể đã có
    // ExpiresAt) + 1 item GIA HẠN trong 1 đơn riêng khác (RenewsFromItemId trỏ về item gốc), đơn gia
    // hạn đang ở Provisioning - test sẽ tự chuyển đơn gia hạn này sang Completed.
    private static async Task<(OrderRequestItem OriginalItem, OrderRequest RenewalOrder, OrderRequestItem RenewalItem)> SeedRenewalScenarioAsync(
        AppDbContext context,
        DateTime? originalExpiresAt)
    {
        var originalItem = new OrderRequestItem { ServicePlanId = 1, PeriodMonths = 1, Quantity = 1, UnitPrice = 100000m, LineTotal = 100000m, ExpiresAt = originalExpiresAt };
        var originalOrder = new OrderRequest
        {
            OrderCode = "ORD-ORIGINAL-001",
            CustomerType = CustomerType.Individual,
            CustomerName = "Original Customer",
            CustomerEmail = "original@example.com",
            CustomerPhone = "0900000001",
            TotalPrice = originalItem.LineTotal,
            Status = OrderRequestStatus.Completed,
            CreatedAt = DateTime.UtcNow,
            Items = { originalItem }
        };
        context.OrderRequests.Add(originalOrder);
        await context.SaveChangesAsync();

        var renewalItem = new OrderRequestItem
        {
            ServicePlanId = 1,
            PeriodMonths = 1,
            Quantity = 1,
            UnitPrice = 100000m,
            LineTotal = 100000m,
            RenewsFromItemId = originalItem.Id
        };
        var renewalOrder = new OrderRequest
        {
            OrderCode = "ORD-RENEWAL-001",
            CustomerType = CustomerType.Individual,
            CustomerName = "Original Customer",
            CustomerEmail = "original@example.com",
            CustomerPhone = "0900000001",
            TotalPrice = renewalItem.LineTotal,
            Status = OrderRequestStatus.Provisioning,
            CreatedAt = DateTime.UtcNow,
            Items = { renewalItem }
        };
        context.OrderRequests.Add(renewalOrder);
        await context.SaveChangesAsync();

        return (originalItem, renewalOrder, renewalItem);
    }

    // Kịch bản đổi gói (Phần 6): 1 item GỐC "đang sống" (đã Completed, ExpiresAt trong tương lai, đang
    // ở ServicePlan #1 seed sẵn "VPS SSD Starter") + 1 item "biên lai đổi gói" trong 1 đơn riêng khác
    // (ChangesFromItemId trỏ về item gốc, ServicePlanId/PlanPriceId = gói ĐÍCH #2 "VPS SSD Business",
    // UnitPrice = số tiền phụ thu proration - KHÔNG phải giá đầy đủ của gói #2), đơn đổi gói đang ở
    // Provisioning - test tự chuyển đơn này sang Completed. PlanPrice đích seed riêng (Id=901, khác
    // dữ liệu HasData 1-4) - không phụ thuộc InMemory provider có tự nạp seed data hay không.
    private static async Task<(OrderRequestItem OriginalItem, OrderRequest ChangeOrder, OrderRequestItem ChangeItem)> SeedPlanChangeScenarioAsync(
        AppDbContext context,
        DateTime originalExpiresAt)
    {
        context.PlanPrices.Add(new PlanPrice { Id = 901, PlanId = 2, PeriodMonths = 1, Price = 299000m, IsDefault = true, IsActive = true, IsCurrent = true });
        await context.SaveChangesAsync();

        var originalItem = new OrderRequestItem { ServicePlanId = 1, PlanPriceId = 1, PeriodMonths = 1, Quantity = 1, UnitPrice = 99000m, LineTotal = 99000m, ExpiresAt = originalExpiresAt };
        var originalOrder = new OrderRequest
        {
            OrderCode = "ORD-CHANGE-ORIGINAL-001",
            CustomerType = CustomerType.Individual,
            CustomerName = "Change Customer",
            CustomerEmail = "change@example.com",
            CustomerPhone = "0900000002",
            TotalPrice = originalItem.LineTotal,
            Status = OrderRequestStatus.Completed,
            CreatedAt = DateTime.UtcNow,
            Items = { originalItem }
        };
        context.OrderRequests.Add(originalOrder);
        await context.SaveChangesAsync();

        var changeItem = new OrderRequestItem
        {
            ServicePlanId = 2,
            PlanPriceId = 901,
            PeriodMonths = 1,
            Quantity = 1,
            UnitPrice = 65000m, // Số tiền phụ thu proration (KHÔNG phải 299000 - giá đầy đủ gói đích).
            LineTotal = 65000m,
            ChangesFromItemId = originalItem.Id
        };
        var changeOrder = new OrderRequest
        {
            OrderCode = "ORD-CHANGE-UPGRADE-001",
            CustomerType = CustomerType.Individual,
            CustomerName = "Change Customer",
            CustomerEmail = "change@example.com",
            CustomerPhone = "0900000002",
            TotalPrice = changeItem.LineTotal,
            Status = OrderRequestStatus.Provisioning,
            CreatedAt = DateTime.UtcNow,
            Items = { changeItem }
        };
        context.OrderRequests.Add(changeOrder);
        await context.SaveChangesAsync();

        return (originalItem, changeOrder, changeItem);
    }

    private static Mock<IFakeProvisioningGenerator> CreateFakeGeneratorMock()
    {
        var mock = new Mock<IFakeProvisioningGenerator>();
        mock.Setup(g => g.GenerateServerCredentials()).Returns(("203.0.113.10", "TestPassword12345"));
        mock.Setup(g => g.GenerateNameservers()).Returns("ns1.cloudverse.vn, ns2.cloudverse.vn");
        return mock;
    }

    private static OrderRequestStatusTransitionService CreateSut(
        AppDbContext context,
        Mock<IOrderStatusObserver> observerMock,
        Mock<IFakeProvisioningGenerator>? fakeGeneratorMock = null)
    {
        var unitOfWork = TestDbContextFactory.CreateUnitOfWork(context);
        var notifier = new OrderStatusNotifier([observerMock.Object]);
        return new OrderRequestStatusTransitionService(unitOfWork, notifier, (fakeGeneratorMock ?? CreateFakeGeneratorMock()).Object);
    }

    [Fact]
    public async Task TransitionAsync_NotFound_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());

        await Assert.ThrowsAsync<NotFoundException>(() =>
            sut.TransitionAsync(9999, OrderRequestStatus.Contacted, Guid.NewGuid()));
    }

    [Fact]
    public async Task TransitionAsync_FromCompleted_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderRequestAsync(context, status: OrderRequestStatus.Completed);
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());

        await Assert.ThrowsAsync<ValidationException>(() =>
            sut.TransitionAsync(order.Id, OrderRequestStatus.New, Guid.NewGuid()));
    }

    [Fact]
    public async Task TransitionAsync_FromCancelled_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderRequestAsync(context, status: OrderRequestStatus.Cancelled);
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());

        await Assert.ThrowsAsync<ValidationException>(() =>
            sut.TransitionAsync(order.Id, OrderRequestStatus.Confirmed, Guid.NewGuid()));
    }

    [Fact]
    public async Task TransitionAsync_ToPaid_SetsPaidAt()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderRequestAsync(context, status: OrderRequestStatus.Confirmed);
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());

        var before = DateTime.UtcNow;
        var result = await sut.TransitionAsync(order.Id, OrderRequestStatus.Paid, Guid.NewGuid());

        Assert.NotNull(result.PaidAt);
        Assert.True(result.PaidAt >= before);
        Assert.Null(result.ProvisioningStartedAt);
    }

    [Fact]
    public async Task TransitionAsync_ToProvisioning_SetsProvisioningStartedAt()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderRequestAsync(context, status: OrderRequestStatus.Paid);
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());

        var before = DateTime.UtcNow;
        var result = await sut.TransitionAsync(order.Id, OrderRequestStatus.Provisioning, Guid.NewGuid());

        Assert.NotNull(result.ProvisioningStartedAt);
        Assert.True(result.ProvisioningStartedAt >= before);
    }

    [Fact]
    public async Task TransitionAsync_NotifiesObserverWithOldAndNewStatus()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderRequestAsync(context, status: OrderRequestStatus.New);
        var observerMock = new Mock<IOrderStatusObserver>();
        var sut = CreateSut(context, observerMock);
        var changedByUserId = Guid.NewGuid();

        await sut.TransitionAsync(order.Id, OrderRequestStatus.Contacted, changedByUserId);

        observerMock.Verify(o => o.OnStatusChangedAsync(
            order.Id, OrderRequestStatus.New, OrderRequestStatus.Contacted, changedByUserId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task TransitionAsync_NullChangedByUserId_DoesNotThrowAndLeavesAssignedToUserIdNull()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderRequestAsync(context, status: OrderRequestStatus.Paid, assignedToUserId: null);
        var observerMock = new Mock<IOrderStatusObserver>();
        var sut = CreateSut(context, observerMock);

        var result = await sut.TransitionAsync(order.Id, OrderRequestStatus.Provisioning, null);

        Assert.Null(result.AssignedToUserId);
        observerMock.Verify(o => o.OnStatusChangedAsync(
            order.Id, OrderRequestStatus.Paid, OrderRequestStatus.Provisioning, null, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task TransitionAsync_ToCompleted_ServicePlanItem_GeneratesIpAndPassword()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderRequestAsync(context, status: OrderRequestStatus.Provisioning, useTldItem: false);
        var fakeGeneratorMock = CreateFakeGeneratorMock();
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>(), fakeGeneratorMock);

        var result = await sut.TransitionAsync(order.Id, OrderRequestStatus.Completed, Guid.NewGuid());

        var item = Assert.Single(result.Items);
        Assert.Equal("203.0.113.10", item.ProvisionedIpAddress);
        Assert.Equal("TestPassword12345", item.ProvisionedRootPassword);
        Assert.Null(item.ProvisionedNameservers);
        fakeGeneratorMock.Verify(g => g.GenerateServerCredentials(), Times.Once);
        fakeGeneratorMock.Verify(g => g.GenerateNameservers(), Times.Never);
    }

    [Fact]
    public async Task TransitionAsync_ToCompleted_TldItem_GeneratesNameservers()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderRequestAsync(context, status: OrderRequestStatus.Provisioning, useTldItem: true);
        var fakeGeneratorMock = CreateFakeGeneratorMock();
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>(), fakeGeneratorMock);

        var result = await sut.TransitionAsync(order.Id, OrderRequestStatus.Completed, Guid.NewGuid());

        var item = Assert.Single(result.Items);
        Assert.Equal("ns1.cloudverse.vn, ns2.cloudverse.vn", item.ProvisionedNameservers);
        Assert.Null(item.ProvisionedIpAddress);
        Assert.Null(item.ProvisionedRootPassword);
        fakeGeneratorMock.Verify(g => g.GenerateNameservers(), Times.Once);
        fakeGeneratorMock.Verify(g => g.GenerateServerCredentials(), Times.Never);
    }

    [Fact]
    public async Task TransitionAsync_ToCompleted_SetsProvisionedAt()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderRequestAsync(context, status: OrderRequestStatus.Provisioning);
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());

        var before = DateTime.UtcNow;
        var result = await sut.TransitionAsync(order.Id, OrderRequestStatus.Completed, Guid.NewGuid());

        var item = Assert.Single(result.Items);
        Assert.NotNull(item.ProvisionedAt);
        Assert.True(item.ProvisionedAt >= before);
    }

    [Fact]
    public async Task TransitionAsync_ToCompleted_ServicePlanItem_SetsExpiresAtByPeriodMonths()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = new OrderRequest
        {
            OrderCode = "ORD-TEST-EXPIRY-PLAN",
            CustomerType = CustomerType.Individual,
            CustomerName = "Test Customer",
            CustomerEmail = "test@example.com",
            CustomerPhone = "0900000000",
            TotalPrice = 1000000m,
            Status = OrderRequestStatus.Provisioning,
            CreatedAt = DateTime.UtcNow,
            Items = { new OrderRequestItem { ServicePlanId = 1, PeriodMonths = 12, Quantity = 1, UnitPrice = 1000000m, LineTotal = 1000000m } }
        };
        context.OrderRequests.Add(order);
        await context.SaveChangesAsync();
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());

        var before = DateTime.UtcNow;
        var result = await sut.TransitionAsync(order.Id, OrderRequestStatus.Completed, Guid.NewGuid());
        var after = DateTime.UtcNow;

        var item = Assert.Single(result.Items);
        Assert.NotNull(item.ExpiresAt);
        Assert.InRange(item.ExpiresAt!.Value, before.AddMonths(12), after.AddMonths(12));
    }

    [Fact]
    public async Task TransitionAsync_ToCompleted_TldItem_SetsExpiresAtByYears()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = new OrderRequest
        {
            OrderCode = "ORD-TEST-EXPIRY-TLD",
            CustomerType = CustomerType.Individual,
            CustomerName = "Test Customer",
            CustomerEmail = "test@example.com",
            CustomerPhone = "0900000000",
            TotalPrice = 500000m,
            Status = OrderRequestStatus.Provisioning,
            CreatedAt = DateTime.UtcNow,
            Items = { new OrderRequestItem { TldPricingId = 1, DomainName = "example", Quantity = 2, UnitPrice = 250000m, LineTotal = 500000m } }
        };
        context.OrderRequests.Add(order);
        await context.SaveChangesAsync();
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());

        var before = DateTime.UtcNow;
        var result = await sut.TransitionAsync(order.Id, OrderRequestStatus.Completed, Guid.NewGuid());
        var after = DateTime.UtcNow;

        var item = Assert.Single(result.Items);
        Assert.NotNull(item.ExpiresAt);
        Assert.InRange(item.ExpiresAt!.Value, before.AddYears(2), after.AddYears(2));
    }

    [Fact]
    public async Task TransitionAsync_ToCompleted_RenewalBeforeExpiry_ExtendsFromOriginalExpiresAt()
    {
        using var context = TestDbContextFactory.CreateContext();
        var originalExpiresAt = DateTime.UtcNow.AddDays(10);
        var (originalItem, renewalOrder, renewalItem) = await SeedRenewalScenarioAsync(context, originalExpiresAt);
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());

        await sut.TransitionAsync(renewalOrder.Id, OrderRequestStatus.Completed, Guid.NewGuid());

        var reloadedOriginal = context.OrderRequestItems.Single(i => i.Id == originalItem.Id);
        Assert.Equal(originalExpiresAt.AddMonths(renewalItem.PeriodMonths!.Value), reloadedOriginal.ExpiresAt);
    }

    [Fact]
    public async Task TransitionAsync_ToCompleted_RenewalAfterExpiry_ExtendsFromNow()
    {
        using var context = TestDbContextFactory.CreateContext();
        var originalExpiresAt = DateTime.UtcNow.AddDays(-10);
        var (originalItem, renewalOrder, renewalItem) = await SeedRenewalScenarioAsync(context, originalExpiresAt);
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());

        var before = DateTime.UtcNow;
        await sut.TransitionAsync(renewalOrder.Id, OrderRequestStatus.Completed, Guid.NewGuid());
        var after = DateTime.UtcNow;

        var reloadedOriginal = context.OrderRequestItems.Single(i => i.Id == originalItem.Id);
        Assert.NotNull(reloadedOriginal.ExpiresAt);
        Assert.InRange(
            reloadedOriginal.ExpiresAt!.Value,
            before.AddMonths(renewalItem.PeriodMonths!.Value),
            after.AddMonths(renewalItem.PeriodMonths!.Value));
    }

    [Fact]
    public async Task TransitionAsync_ToCompleted_RenewalItem_DoesNotGenerateFreshCredentialsOrOwnExpiresAt()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (_, renewalOrder, renewalItem) = await SeedRenewalScenarioAsync(context, DateTime.UtcNow.AddDays(10));
        var fakeGeneratorMock = CreateFakeGeneratorMock();
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>(), fakeGeneratorMock);

        await sut.TransitionAsync(renewalOrder.Id, OrderRequestStatus.Completed, Guid.NewGuid());

        var reloadedRenewalItem = context.OrderRequestItems.Single(i => i.Id == renewalItem.Id);
        Assert.Null(reloadedRenewalItem.ExpiresAt);
        Assert.Null(reloadedRenewalItem.ProvisionedIpAddress);
        Assert.Null(reloadedRenewalItem.ProvisionedRootPassword);
        Assert.NotNull(reloadedRenewalItem.ProvisionedAt);
        fakeGeneratorMock.Verify(g => g.GenerateServerCredentials(), Times.Never);
        fakeGeneratorMock.Verify(g => g.GenerateNameservers(), Times.Never);
    }

    [Fact]
    public async Task TransitionAsync_ToCompleted_PlanChangeItem_AppliesTargetPlanToOriginalAndKeepsExpiresAt()
    {
        using var context = TestDbContextFactory.CreateContext();
        var originalExpiresAt = DateTime.UtcNow.AddDays(10);
        var (originalItem, changeOrder, _) = await SeedPlanChangeScenarioAsync(context, originalExpiresAt);
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());

        await sut.TransitionAsync(changeOrder.Id, OrderRequestStatus.Completed, Guid.NewGuid());

        var reloadedOriginal = context.OrderRequestItems.Single(i => i.Id == originalItem.Id);
        Assert.Equal(2, reloadedOriginal.ServicePlanId);
        Assert.Equal(901, reloadedOriginal.PlanPriceId);
        // Giá ĐẦY ĐỦ của gói đích (PlanPrice #901 = 299000), KHÔNG phải UnitPrice của item đổi gói
        // (65000 - đó là số tiền phụ thu proration).
        Assert.Equal(299000m, reloadedOriginal.UnitPrice);
        Assert.Equal(299000m, reloadedOriginal.LineTotal);
        // Hạn dùng GIỮ NGUYÊN - đổi gói không dời hạn (khác gia hạn).
        Assert.Equal(originalExpiresAt, reloadedOriginal.ExpiresAt);
    }

    [Fact]
    public async Task TransitionAsync_ToCompleted_PlanChangeItem_DoesNotGenerateFreshCredentialsOrOwnExpiresAt()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (_, changeOrder, changeItem) = await SeedPlanChangeScenarioAsync(context, DateTime.UtcNow.AddDays(10));
        var fakeGeneratorMock = CreateFakeGeneratorMock();
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>(), fakeGeneratorMock);

        await sut.TransitionAsync(changeOrder.Id, OrderRequestStatus.Completed, Guid.NewGuid());

        var reloadedChangeItem = context.OrderRequestItems.Single(i => i.Id == changeItem.Id);
        Assert.Null(reloadedChangeItem.ExpiresAt);
        Assert.NotNull(reloadedChangeItem.ProvisionedAt);
        fakeGeneratorMock.Verify(g => g.GenerateServerCredentials(), Times.Never);
        fakeGeneratorMock.Verify(g => g.GenerateNameservers(), Times.Never);
    }
}
