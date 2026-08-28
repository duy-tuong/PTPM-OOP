using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Observers;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;

namespace CloudServiceStore.Tests.Infrastructure.Observers;

public class NotificationConsultationObserverTests
{
    private static async Task<ConsultationRequest> SeedRequestAsync(AppDbContext context, Guid? customerId)
    {
        var request = new ConsultationRequest
        {
            RequestCode = "CONS-NOTI-TEST",
            CustomerId = customerId,
            CustomerType = CustomerType.Individual,
            FullName = "Test Customer",
            Email = "customer@example.com",
            Phone = "0900000000",
            Subject = "Test subject",
            Message = "Test message",
            CreatedAt = DateTime.UtcNow
        };
        context.ConsultationRequests.Add(request);
        await context.SaveChangesAsync();
        return request;
    }

    private static NotificationConsultationObserver CreateSut(AppDbContext context) =>
        new(TestDbContextFactory.CreateUnitOfWork(context));

    [Theory]
    [InlineData(ConsultationStatus.Contacted)]
    [InlineData(ConsultationStatus.Resolved)]
    [InlineData(ConsultationStatus.Closed)]
    public async Task OnStatusChangedAsync_MeaningfulStatus_CustomerHasAccount_CreatesNotification(ConsultationStatus newStatus)
    {
        using var context = TestDbContextFactory.CreateContext();
        var customerId = Guid.NewGuid();
        var request = await SeedRequestAsync(context, customerId);
        var sut = CreateSut(context);

        await sut.OnStatusChangedAsync(request.Id, ConsultationStatus.New, newStatus, Guid.NewGuid());
        await context.SaveChangesAsync();

        var notification = Assert.Single(context.CustomerNotifications, n => n.CustomerId == customerId);
        Assert.Contains(request.RequestCode, notification.Message);
        Assert.Equal("/khach-hang/yeu-cau-tu-van", notification.LinkUrl);
    }

    [Fact]
    public async Task OnStatusChangedAsync_GuestRequest_NoCustomerId_DoesNotCreateNotification()
    {
        using var context = TestDbContextFactory.CreateContext();
        var request = await SeedRequestAsync(context, customerId: null);
        var sut = CreateSut(context);

        await sut.OnStatusChangedAsync(request.Id, ConsultationStatus.New, ConsultationStatus.Contacted, Guid.NewGuid());
        await context.SaveChangesAsync();

        Assert.Empty(context.CustomerNotifications);
    }
}
