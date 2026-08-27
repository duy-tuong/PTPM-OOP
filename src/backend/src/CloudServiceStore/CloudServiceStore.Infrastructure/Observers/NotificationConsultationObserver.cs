using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Infrastructure.Observers;

// Observer pattern - tạo thông báo trong app (chuông Navbar) song song với email (EmailConsultationObserver)
// khi ConsultationRequest đổi trạng thái tới 1 mốc có ý nghĩa. CHỈ tạo khi request có CustomerId thật
// (khách gửi tư vấn có tài khoản) - khách vãng lai không có "hộp thư" nào để nhận, vẫn chỉ được báo
// qua email như observer kia. Cố ý KHÔNG gọi SaveChangesAsync - gộp chung transaction với
// ConsultationStatusNotifier.NotifyAsync's caller, mirror AuditLogConsultationObserver.cs.
public class NotificationConsultationObserver : IConsultationStatusObserver
{
    private readonly IUnitOfWork _unitOfWork;

    public NotificationConsultationObserver(IUnitOfWork unitOfWork)
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
        if (!EmailConsultationObserver.IsNotifiableStatus(newStatus))
        {
            return;
        }

        var request = await _unitOfWork.Repository<ConsultationRequest, int>().GetByIdAsync(consultationRequestId, cancellationToken);
        if (request is null || request.CustomerId is null)
        {
            return;
        }

        var (title, message) = BuildContent(newStatus, request);
        var notification = new CustomerNotification
        {
            CustomerId = request.CustomerId.Value,
            Title = title,
            Message = message,
            LinkUrl = "/khach-hang/yeu-cau-tu-van",
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<CustomerNotification, long>().AddAsync(notification, cancellationToken);
    }

    private static (string Title, string Message) BuildContent(ConsultationStatus newStatus, ConsultationRequest request) => newStatus switch
    {
        ConsultationStatus.Contacted => ("Yêu cầu tư vấn đang được xử lý", $"Yêu cầu {request.RequestCode} đã được tiếp nhận và đang được liên hệ."),
        ConsultationStatus.Resolved => ("Yêu cầu tư vấn đã được xử lý", $"Yêu cầu {request.RequestCode} đã được xử lý xong."),
        ConsultationStatus.Closed => ("Yêu cầu tư vấn đã đóng", $"Yêu cầu {request.RequestCode} đã được đóng."),
        _ => throw new InvalidOperationException($"Trạng thái {newStatus} không có thông báo tương ứng - IsNotifiableStatus đã lọc trước, không nên tới được đây.")
    };
}
