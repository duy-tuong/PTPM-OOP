using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Infrastructure.Observers;

// Observer pattern - mirror EmailOrderObserver.cs cho ConsultationRequest. Chỉ báo 3 trạng thái sau
// New (New là lúc khởi tạo, không phải kết quả 1 lần đổi trạng thái nên không cần liệt kê) - khác
// OrderRequest (New/Contacted/Confirmed cố tình im lặng vì đơn hàng có nhiều bước trung gian hơn),
// ConsultationRequest chỉ có 3 bước sau New nên cả 3 đều là tin có ý nghĩa với khách đang chờ phản hồi.
public class EmailConsultationObserver : IConsultationStatusObserver
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailService _emailService;

    public EmailConsultationObserver(IUnitOfWork unitOfWork, IEmailService emailService)
    {
        _unitOfWork = unitOfWork;
        _emailService = emailService;
    }

    public async Task OnStatusChangedAsync(
        int consultationRequestId,
        ConsultationStatus oldStatus,
        ConsultationStatus newStatus,
        Guid? changedByUserId,
        CancellationToken cancellationToken = default)
    {
        if (!IsNotifiableStatus(newStatus))
        {
            return;
        }

        var request = await _unitOfWork.Repository<ConsultationRequest, int>().GetByIdAsync(consultationRequestId, cancellationToken);
        if (request is null)
        {
            return;
        }

        var (subject, body) = BuildEmailContent(newStatus, request);
        await _emailService.SendAsync(request.Email, subject, body, cancellationToken);
    }

    public static bool IsNotifiableStatus(ConsultationStatus status) =>
        status is ConsultationStatus.Contacted or ConsultationStatus.Resolved or ConsultationStatus.Closed;

    private static (string Subject, string Body) BuildEmailContent(ConsultationStatus newStatus, ConsultationRequest request) => newStatus switch
    {
        ConsultationStatus.Contacted => (
            "Yêu cầu tư vấn đang được xử lý - Cloudverse",
            $"Chào {request.FullName},\n\nYêu cầu tư vấn {request.RequestCode} của bạn đã được đội ngũ Cloudverse tiếp nhận và đang liên hệ với bạn."),
        ConsultationStatus.Resolved => (
            "Yêu cầu tư vấn đã được xử lý - Cloudverse",
            $"Chào {request.FullName},\n\nYêu cầu tư vấn {request.RequestCode} của bạn đã được xử lý xong. Nếu cần hỗ trợ thêm, vui lòng gửi yêu cầu mới hoặc liên hệ lại với chúng tôi."),
        ConsultationStatus.Closed => (
            "Yêu cầu tư vấn đã đóng - Cloudverse",
            $"Chào {request.FullName},\n\nYêu cầu tư vấn {request.RequestCode} của bạn đã được đóng."),
        _ => throw new InvalidOperationException($"Trạng thái {newStatus} không có email tương ứng - IsNotifiableStatus đã lọc trước, không nên tới được đây.")
    };
}
