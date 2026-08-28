using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Observers;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;

namespace CloudServiceStore.Tests.Infrastructure.Observers;

public class NotificationOrderObserverTests
{
    private static async Task<OrderRequest> SeedOrderAsync(AppDbContext context, Guid? customerId)
    {
        var order = new OrderRequest
        {
            OrderCode = "ORD-NOTI-TEST",
            CustomerId = customerId,
            CustomerType = CustomerType.Individual,
            CustomerName = "Test Customer",
            CustomerEmail = "customer@example.com",
            CustomerPhone = "0900000000",
            TotalPrice = 100000m,
            CreatedAt = DateTime.UtcNow,
            Items = { new OrderRequestItem { ServicePlanId = 1, Quantity = 1, UnitPrice = 100000m, LineTotal = 100000m } }
        };
        context.OrderRequests.Add(order);
        await context.SaveChangesAsync();
        return order;
    }

    private static NotificationOrderObserver CreateSut(AppDbContext context) =>
        new(TestDbContextFactory.CreateUnitOfWork(context));

    [Theory]
    [InlineData(OrderRequestStatus.Paid)]
    [InlineData(OrderRequestStatus.Provisioning)]
    [InlineData(OrderRequestStatus.Completed)]
    [InlineData(OrderRequestStatus.Cancelled)]
    public async Task OnStatusChangedAsync_MeaningfulStatus_CustomerHasAccount_CreatesNotification(OrderRequestStatus newStatus)
    {
        using var context = TestDbContextFactory.CreateContext();
        var customerId = Guid.NewGuid();
        var order = await SeedOrderAsync(context, customerId);
        var sut = CreateSut(context);

        await sut.OnStatusChangedAsync(order.Id, OrderRequestStatus.Confirmed, newStatus, Guid.NewGuid());
        await context.SaveChangesAsync();

        var notification = Assert.Single(context.CustomerNotifications, n => n.CustomerId == customerId);
        Assert.Contains(order.OrderCode, notification.Message);
        Assert.Equal("/khach-hang/don-hang", notification.LinkUrl);
        Assert.False(notification.IsRead);
    }

    [Theory]
    [InlineData(OrderRequestStatus.Contacted)]
    [InlineData(OrderRequestStatus.Confirmed)]
    public async Task OnStatusChangedAsync_NonMeaningfulStatus_DoesNotCreateNotification(OrderRequestStatus newStatus)
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderAsync(context, Guid.NewGuid());
        var sut = CreateSut(context);

        await sut.OnStatusChangedAsync(order.Id, OrderRequestStatus.New, newStatus, Guid.NewGuid());
        await context.SaveChangesAsync();

        Assert.Empty(context.CustomerNotifications);
    }

    [Fact]
    public async Task OnStatusChangedAsync_GuestOrder_NoCustomerId_DoesNotCreateNotification()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderAsync(context, customerId: null);
        var sut = CreateSut(context);

        await sut.OnStatusChangedAsync(order.Id, OrderRequestStatus.Confirmed, OrderRequestStatus.Paid, Guid.NewGuid());
        await context.SaveChangesAsync();

        Assert.Empty(context.CustomerNotifications);
    }
}
