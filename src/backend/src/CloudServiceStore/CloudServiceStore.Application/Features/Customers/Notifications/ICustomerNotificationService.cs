using CloudServiceStore.Application.Features.Customers.Notifications.Dtos;

namespace CloudServiceStore.Application.Features.Customers.Notifications;

public interface ICustomerNotificationService
{
    Task<List<CustomerNotificationDto>> GetMineAsync(Guid customerId, int take = 20, CancellationToken cancellationToken = default);

    Task<int> GetUnreadCountAsync(Guid customerId, CancellationToken cancellationToken = default);

    Task MarkAsReadAsync(Guid customerId, long notificationId, CancellationToken cancellationToken = default);

    Task MarkAllAsReadAsync(Guid customerId, CancellationToken cancellationToken = default);
}
