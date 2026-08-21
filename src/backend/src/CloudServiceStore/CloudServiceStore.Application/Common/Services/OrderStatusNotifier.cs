using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Common.Services;

// Observer pattern — phần "Subject": nhận danh sách toàn bộ IOrderStatusObserver đã đăng ký qua DI
// (services.AddScoped<IOrderStatusObserver, ...>() ở Infrastructure) rồi lần lượt thông báo cho từng
// observer khi OrderRequest đổi trạng thái. Muốn thêm hành vi mới (vd gửi email) chỉ cần thêm 1
// class implement IOrderStatusObserver + đăng ký DI, không phải sửa class này.
public class OrderStatusNotifier
{
    private readonly IEnumerable<IOrderStatusObserver> _observers;

    public OrderStatusNotifier(IEnumerable<IOrderStatusObserver> observers)
    {
        _observers = observers;
    }

    public async Task NotifyAsync(
        int orderRequestId,
        OrderRequestStatus oldStatus,
        OrderRequestStatus newStatus,
        Guid? changedByUserId,
        CancellationToken cancellationToken = default)
    {
        foreach (var observer in _observers)
        {
            await observer.OnStatusChangedAsync(orderRequestId, oldStatus, newStatus, changedByUserId, cancellationToken);
        }
    }
}
