using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Common.Interfaces;

// Observer pattern - mirror IOrderStatusObserver.cs 1-1 cho ConsultationRequest (trước đây
// AdminConsultationRequestService tự làm inline audit log + email, refactor sang đúng pattern đã dùng
// cho OrderRequest khi cần thêm concern thứ 2 - CustomerNotification - để không lặp lại 2 cách khác
// nhau cho cùng 1 dạng bài toán "báo cho ai đó khi trạng thái đổi").
public interface IConsultationStatusObserver
{
    Task OnStatusChangedAsync(
        int consultationRequestId,
        ConsultationStatus oldStatus,
        ConsultationStatus newStatus,
        Guid? changedByUserId,
        CancellationToken cancellationToken = default);
}
