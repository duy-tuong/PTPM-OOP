using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Common.Interfaces;

// Observer pattern: mọi bên "quan tâm" tới việc đổi trạng thái OrderRequest implement interface này
// và tự đăng ký qua DI (xem OrderStatusNotifier) — không cần OrderStatusNotifier biết trước có bao
// nhiêu observer hay chúng làm gì (vd ghi audit log, gửi email...).
public interface IOrderStatusObserver
{
    Task OnStatusChangedAsync(
        int orderRequestId,
        OrderRequestStatus oldStatus,
        OrderRequestStatus newStatus,
        Guid? changedByUserId,
        CancellationToken cancellationToken = default);
}
