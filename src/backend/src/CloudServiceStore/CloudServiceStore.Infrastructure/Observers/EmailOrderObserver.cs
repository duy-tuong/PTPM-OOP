 using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;


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
        if (!IsNotifiableStatus(newStatus))
        {
            return;
        }


        // .Include Items - email lúc Completed cần liệt kê từng dòng kèm thông tin bàn giao (Tier 3),
        // GetByIdAsync (không Include) không đủ cho việc này.
        var order = await _unitOfWork.Repository<OrderRequest, int>().Query()
            .Include(o => o.Items).ThenInclude(i => i.ServicePlan)
            .Include(o => o.Items).ThenInclude(i => i.TldPricing)
            .FirstOrDefaultAsync(o => o.Id == orderRequestId, cancellationToken);


        if (order is null)
        {
            return;
        }


        var (subject, body) = BuildEmailContent(newStatus, order);
        await _emailService.SendAsync(order.CustomerEmail, subject, body, cancellationToken);
    }


    // public - NotificationOrderObserver.cs tái dùng đúng danh sách này (chỉ tạo thông báo trong app cho
    // đúng những trạng thái cũng gửi email, không muốn 2 danh sách lệch nhau).
    public static bool IsNotifiableStatus(OrderRequestStatus status) =>
        status is OrderRequestStatus.Paid or OrderRequestStatus.Provisioning
            or OrderRequestStatus.Completed or OrderRequestStatus.Cancelled;


    private static (string Subject, string Body) BuildEmailContent(OrderRequestStatus newStatus, OrderRequest order) => newStatus switch
    {
        OrderRequestStatus.Paid => ("Đã nhận thanh toán - Cloudverse", $"Đơn hàng {order.OrderCode} đã được xác nhận thanh toán. Chúng tôi sẽ sớm triển khai dịch vụ cho bạn."),
        OrderRequestStatus.Provisioning => ("Đang triển khai dịch vụ - Cloudverse", $"Đơn hàng {order.OrderCode} đang được triển khai."),
        OrderRequestStatus.Completed => ("Bàn giao hoàn tất - Cloudverse", BuildCompletedBody(order)),
        // Đợt 13, Phần 4 (D4) - trước đây 1 câu cố định cho mọi lý do huỷ, khiến khách ĐÃ thu tiền
        // (Paid/Provisioning bị Admin huỷ, hoặc hệ thống tự huỷ đơn New quá hạn không liên quan) nhận
        // đúng email như khách chưa từng trả đồng nào - dễ gây hoang mang "tiền tôi đâu?" mà không có
        // lời hứa xử lý nào trong chính email. PaidAt has_value là tín hiệu duy nhất đáng tin (set lúc
        // webhook PayOS xác nhận thanh toán), không phụ thuộc AI huỷ (Admin hay hệ thống tự huỷ).
        OrderRequestStatus.Cancelled => order.PaidAt is not null
            ? ("Đơn hàng đã huỷ - Cloudverse", $"Đơn hàng {order.OrderCode} đã bị huỷ. Chúng tôi ghi nhận đơn này đã được thanh toán trước đó - đội ngũ CSKH sẽ liên hệ để xử lý hoàn tiền trong thời gian sớm nhất.")
            : ("Đơn hàng đã huỷ - Cloudverse", $"Đơn hàng {order.OrderCode} đã bị huỷ."),
        _ => throw new InvalidOperationException($"Trạng thái {newStatus} không có email tương ứng - IsNotifiableStatus đã lọc trước, không nên tới được đây.")
    };


    // Kèm luôn thông tin bàn giao trong email - trước đây email Completed chỉ báo "đã sẵn sàng sử
    // dụng" mà không có IP/mật khẩu, khiến khách đặt hàng ẩn danh (không có tài khoản để tra lại) mất
    // vĩnh viễn quyền truy cập nếu lỡ xoá email này. Giờ email là bản lưu lâu dài, không phụ thuộc đăng nhập.
    private static string BuildCompletedBody(OrderRequest order)
    {
        var itemLines = order.Items.Select(BuildItemHandoverLine);
        return $"Đơn hàng {order.OrderCode} đã hoàn tất, dịch vụ đã sẵn sàng sử dụng.\n\nThông tin bàn giao:\n{string.Join("\n", itemLines)}";
    }


    private static string BuildItemHandoverLine(OrderRequestItem item)
    {
        var name = item.ServicePlan?.Name ?? (item.TldPricing is not null ? $"{item.DomainName}{item.TldPricing.Tld}" : "Sản phẩm");


        // Item gia hạn (Tier 4) không sinh credential mới - chỉ cộng dồn hạn dùng vào item gốc, nên
        // không hiện dòng IP/mật khẩu trống gây hiểu nhầm.
        if (item.RenewsFromItemId is not null)
        {
            return $"- {name}: gia hạn thành công, thời hạn sử dụng đã được cộng dồn.";
        }


        if (item.ProvisionedIpAddress is not null)
        {
            return $"- {name}: IP {item.ProvisionedIpAddress}, mật khẩu root {item.ProvisionedRootPassword}";
        }


        if (item.ProvisionedNameservers is not null)
        {
            return $"- {name}: Nameserver {item.ProvisionedNameservers}";
        }


        return $"- {name}";
    }
}

