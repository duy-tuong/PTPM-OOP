using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Infrastructure.Observers;

// Observer pattern — implementation thứ 2 của IOrderStatusObserver (cùng đăng ký song song với
// AuditLogOrderObserver, OrderStatusNotifier tự loop qua IEnumerable<IOrderStatusObserver>, không cần
// sửa gì ở Subject). Chỉ gửi email cho 4 mốc có ý nghĩa với khách hàng - New/Contacted/Confirmed chưa
// đủ "chắc chắn" để làm phiền khách, tương tự cách nhiều nhà cung cấp thật chỉ báo khi tiền vào/hàng
// giao chứ không báo mỗi lần nhân viên nội bộ đổi trạng thái theo dõi.
public class EmailOrderObserver : IOrderStatusObserver
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailService _emailService;

    public EmailOrderObserver(IUnitOfWork unitOfWork, IEmailService emailService)
    {
        _unitOfWork = unitOfWork;
        _emailService = emailService;
    }

    public async Task OnStatusChangedAsync(
        int orderRequestId,
        OrderRequestStatus oldStatus,
        OrderRequestStatus newStatus,
        Guid? changedByUserId,
        CancellationToken cancellationToken = default)
    {
        var (subject, body) = BuildEmailContent(newStatus);
        if (subject is null)
        {
            return;
        }

        var order = await _unitOfWork.Repository<OrderRequest, int>().GetByIdAsync(orderRequestId, cancellationToken);
        if (order is null)
        {
            return;
        }

        await _emailService.SendAsync(order.CustomerEmail, subject, string.Format(body!, order.OrderCode), cancellationToken);
    }

    private static (string? Subject, string? Body) BuildEmailContent(OrderRequestStatus newStatus) => newStatus switch
    {
        OrderRequestStatus.Paid => ("Đã nhận thanh toán - Cloudverse", "Đơn hàng {0} đã được xác nhận thanh toán. Chúng tôi sẽ sớm triển khai dịch vụ cho bạn."),
        OrderRequestStatus.Provisioning => ("Đang triển khai dịch vụ - Cloudverse", "Đơn hàng {0} đang được triển khai."),
        OrderRequestStatus.Completed => ("Bàn giao hoàn tất - Cloudverse", "Đơn hàng {0} đã hoàn tất, dịch vụ đã sẵn sàng sử dụng."),
        OrderRequestStatus.Cancelled => ("Đơn hàng đã huỷ - Cloudverse", "Đơn hàng {0} đã bị huỷ."),
        _ => (null, null)
    };
}
