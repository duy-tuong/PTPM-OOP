using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Entities.System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Infrastructure.Observers;

// Observer pattern — 1 implementation cụ thể của IOrderStatusObserver: mỗi khi OrderRequest đổi
// trạng thái, tự động ghi 1 dòng AuditLog. Đồng thời giải quyết luôn yêu cầu đề bài mục 3.2.8
// ("Audit log: ghi lại ai đăng nhập, ai sửa giá, khi nào").
// Cố ý KHÔNG gọi SaveChangesAsync ở đây — service gọi OrderStatusNotifier.NotifyAsync(...) sẽ tự
// SaveChangesAsync 1 lần, gộp chung transaction với việc cập nhật OrderRequest.Status.
public class AuditLogOrderObserver : IOrderStatusObserver
{
    private readonly IUnitOfWork _unitOfWork;

    public AuditLogOrderObserver(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task OnStatusChangedAsync(
        int orderRequestId,
        OrderRequestStatus oldStatus,
        OrderRequestStatus newStatus,
        Guid? changedByUserId,
        CancellationToken cancellationToken = default)
    {
        var auditLog = new AuditLog
        {
            UserId = changedByUserId,
            Action = AuditAction.StatusChange,
            EntityName = nameof(OrderRequest),
            EntityId = orderRequestId.ToString(),
            OldValues = oldStatus.ToString(),
            NewValues = newStatus.ToString(),
            Timestamp = DateTime.UtcNow
        };

        await _unitOfWork.Repository<AuditLog, long>().AddAsync(auditLog, cancellationToken);
    }
}
