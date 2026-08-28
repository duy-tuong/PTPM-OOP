using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Infrastructure.Observers;

// Observer pattern - implementation thứ 3 của IOrderStatusObserver (song song AuditLogOrderObserver/
// EmailOrderObserver, OrderStatusNotifier tự loop qua IEnumerable<IOrderStatusObserver>, không cần sửa
// gì ở Subject - xem OrderStatusNotifier.cs). Tạo thông báo trong app (chuông Navbar) đúng những trạng
// thái cũng gửi email (EmailOrderObserver.IsNotifiableStatus) - CHỈ khi đơn có CustomerId thật (khách
// vãng lai không có "hộp thư" nào để nhận, vẫn chỉ được báo qua email).
public class NotificationOrderObserver : IOrderStatusObserver
{
    private readonly IUnitOfWork _unitOfWork;

    public NotificationOrderObserver(IUnitOfWork unitOfWork)
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
        if (!EmailOrderObserver.IsNotifiableStatus(newStatus))
        {
            return;
        }

        var order = await _unitOfWork.Repository<OrderRequest, int>().GetByIdAsync(orderRequestId, cancellationToken);
        if (order is null || order.CustomerId is null)
        {
            return;
        }

        var (title, message) = BuildContent(newStatus, order);
        var notification = new CustomerNotification
        {
            CustomerId = order.CustomerId.Value,
            Title = title,
            Message = message,
            LinkUrl = "/khach-hang/don-hang",
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<CustomerNotification, long>().AddAsync(notification, cancellationToken);
    }

    private static (string Title, string Message) BuildContent(OrderRequestStatus newStatus, OrderRequest order) => newStatus switch
    {
        OrderRequestStatus.Paid => ("Đã nhận thanh toán", $"Đơn hàng {order.OrderCode} đã được xác nhận thanh toán."),
        OrderRequestStatus.Provisioning => ("Đang triển khai dịch vụ", $"Đơn hàng {order.OrderCode} đang được triển khai."),
        OrderRequestStatus.Completed => ("Bàn giao hoàn tất", $"Đơn hàng {order.OrderCode} đã hoàn tất, dịch vụ đã sẵn sàng sử dụng."),
        OrderRequestStatus.Cancelled => ("Đơn hàng đã huỷ", $"Đơn hàng {order.OrderCode} đã bị huỷ."),
        _ => throw new InvalidOperationException($"Trạng thái {newStatus} không có thông báo tương ứng - IsNotifiableStatus đã lọc trước, không nên tới được đây.")
    };
}
