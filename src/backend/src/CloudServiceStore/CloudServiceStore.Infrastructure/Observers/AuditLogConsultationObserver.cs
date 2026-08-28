using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Entities.System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Infrastructure.Observers;

// Observer pattern - mirror AuditLogOrderObserver.cs 1-1 cho ConsultationRequest (trước đây việc ghi
// AuditLog nằm inline trong AdminConsultationRequestService.UpdateStatusAsync, chuyển ra đây khi thêm
// concern thứ 2 - xem IConsultationStatusObserver.cs). Cố ý KHÔNG gọi SaveChangesAsync ở đây - service
// gọi ConsultationStatusNotifier.NotifyAsync(...) sẽ tự SaveChangesAsync 1 lần, gộp chung transaction.
public class AuditLogConsultationObserver : IConsultationStatusObserver
{
    private readonly IUnitOfWork _unitOfWork;

    public AuditLogConsultationObserver(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task OnStatusChangedAsync(
        int consultationRequestId,
        ConsultationStatus oldStatus,
        ConsultationStatus newStatus,
        Guid? changedByUserId,
        CancellationToken cancellationToken = default)
    {
        var auditLog = new AuditLog
        {
            UserId = changedByUserId,
            Action = AuditAction.StatusChange,
            EntityName = nameof(ConsultationRequest),
            EntityId = consultationRequestId.ToString(),
            OldValues = oldStatus.ToString(),
            NewValues = newStatus.ToString(),
            Timestamp = DateTime.UtcNow
        };

        await _unitOfWork.Repository<AuditLog, long>().AddAsync(auditLog, cancellationToken);
    }
}
