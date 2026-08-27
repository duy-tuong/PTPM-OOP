using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Features.Customers.Notifications;
using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;

namespace CloudServiceStore.Tests.Features.Customers.Notifications;

public class CustomerNotificationServiceTests
{
    private static CustomerNotificationService CreateSut(AppDbContext context) =>
        new(TestDbContextFactory.CreateUnitOfWork(context));

    private static CustomerNotification Seed(AppDbContext context, Guid customerId, string title, bool isRead = false, DateTime? createdAt = null)
    {
        var entity = new CustomerNotification
        {
            CustomerId = customerId,
            Title = title,
            Message = "Test message",
            LinkUrl = "/khach-hang/don-hang",
            IsRead = isRead,
            CreatedAt = createdAt ?? DateTime.UtcNow
        };
        context.CustomerNotifications.Add(entity);
        context.SaveChanges();
        return entity;
    }

    [Fact]
    public async Task GetMineAsync_ReturnsOnlyOwnNotifications_NewestFirst()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customerA = Guid.NewGuid();
        var customerB = Guid.NewGuid();
        Seed(context, customerA, "Older", createdAt: DateTime.UtcNow.AddMinutes(-10));
        Seed(context, customerA, "Newer", createdAt: DateTime.UtcNow);
        Seed(context, customerB, "Not mine");
        var sut = CreateSut(context);

        var result = await sut.GetMineAsync(customerA);

        Assert.Equal(2, result.Count);
        Assert.Equal("Newer", result[0].Title);
        Assert.Equal("Older", result[1].Title);
    }

    [Fact]
    public async Task GetUnreadCountAsync_CountsOnlyUnreadForThatCustomer()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customerId = Guid.NewGuid();
        Seed(context, customerId, "Unread 1");
        Seed(context, customerId, "Unread 2");
        Seed(context, customerId, "Already read", isRead: true);
        Seed(context, Guid.NewGuid(), "Other customer unread");
        var sut = CreateSut(context);

        var count = await sut.GetUnreadCountAsync(customerId);

        Assert.Equal(2, count);
    }

    [Fact]
    public async Task MarkAsReadAsync_OwnNotification_MarksRead()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customerId = Guid.NewGuid();
        var notification = Seed(context, customerId, "Unread");
        var sut = CreateSut(context);

        await sut.MarkAsReadAsync(customerId, notification.Id);

        Assert.Equal(0, await sut.GetUnreadCountAsync(customerId));
    }

    [Fact]
    public async Task MarkAsReadAsync_NotificationBelongsToDifferentCustomer_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var owner = Guid.NewGuid();
        var attacker = Guid.NewGuid();
        var notification = Seed(context, owner, "Unread");
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<NotFoundException>(() => sut.MarkAsReadAsync(attacker, notification.Id));
    }

    [Fact]
    public async Task MarkAsReadAsync_NotFound_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<NotFoundException>(() => sut.MarkAsReadAsync(Guid.NewGuid(), 9999));
    }

    [Fact]
    public async Task MarkAllAsReadAsync_MarksAllUnreadForThatCustomerOnly()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customerId = Guid.NewGuid();
        var otherCustomerId = Guid.NewGuid();
        Seed(context, customerId, "Unread 1");
        Seed(context, customerId, "Unread 2");
        var otherUnread = Seed(context, otherCustomerId, "Other customer unread");
        var sut = CreateSut(context);

        await sut.MarkAllAsReadAsync(customerId);

        Assert.Equal(0, await sut.GetUnreadCountAsync(customerId));
        Assert.Equal(1, await sut.GetUnreadCountAsync(otherCustomerId));
        Assert.False(context.CustomerNotifications.Single(n => n.Id == otherUnread.Id).IsRead);
    }
}
