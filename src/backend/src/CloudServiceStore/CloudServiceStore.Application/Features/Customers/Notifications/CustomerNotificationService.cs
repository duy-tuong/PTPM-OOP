using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Customers.Notifications.Dtos;
using CloudServiceStore.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Customers.Notifications;

// Phía "đọc/thao tác theo khách hàng" (chuông Navbar) - tách khỏi phía "tạo thông báo" (do
// NotificationOrderObserver/NotificationConsultationObserver ở Infrastructure đảm nhiệm khi trạng thái
// đơn hàng/tư vấn đổi, xem 2 file đó), mirror đúng cách CustomerSshKeyService.cs tách biệt CRUD-theo-
// khách khỏi nơi dữ liệu được ghi vào (OrderRequestService.BuildServicePlanItemAsync).
public class CustomerNotificationService : ICustomerNotificationService
{
    private readonly IUnitOfWork _unitOfWork;

    public CustomerNotificationService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<CustomerNotificationDto>> GetMineAsync(Guid customerId, int take = 20, CancellationToken cancellationToken = default)
    {
        var entities = await _unitOfWork.Repository<CustomerNotification, long>().Query()
            .Where(n => n.CustomerId == customerId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(take)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto).ToList();
    }

    public Task<int> GetUnreadCountAsync(Guid customerId, CancellationToken cancellationToken = default) =>
        _unitOfWork.Repository<CustomerNotification, long>().Query()
            .CountAsync(n => n.CustomerId == customerId && !n.IsRead, cancellationToken);

    public async Task MarkAsReadAsync(Guid customerId, long notificationId, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<CustomerNotification, long>();
        var entity = await repository.GetByIdAsync(notificationId, cancellationToken);

        // Dùng chung 404 cho cả "không tồn tại" lẫn "không phải chủ thông báo" - mirror
        // CustomerSshKeyService.DeleteAsync, tránh lộ thông tin thông báo người khác tồn tại.
        if (entity is null || entity.CustomerId != customerId)
        {
            throw new NotFoundException(nameof(CustomerNotification), notificationId);
        }

        if (entity.IsRead)
        {
            return;
        }

        entity.IsRead = true;
        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkAllAsReadAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<CustomerNotification, long>();

        // Load-rồi-Save thay vì ExecuteUpdateAsync - EF Core InMemory provider (dùng trong test qua
        // TestDbContextFactory) không hỗ trợ bulk ExecuteUpdateAsync/ExecuteDeleteAsync, mirror pattern
        // đã áp dụng cho NewsArticleService.IncrementViewCountAsync.
        var unread = await repository.Query()
            .Where(n => n.CustomerId == customerId && !n.IsRead)
            .ToListAsync(cancellationToken);

        if (unread.Count == 0)
        {
            return;
        }

        foreach (var entity in unread)
        {
            entity.IsRead = true;
            repository.Update(entity);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static CustomerNotificationDto MapToDto(CustomerNotification entity) => new()
    {
        Id = entity.Id,
        Title = entity.Title,
        Message = entity.Message,
        LinkUrl = entity.LinkUrl,
        IsRead = entity.IsRead,
        CreatedAt = entity.CreatedAt
    };
}
