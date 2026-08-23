using CloudServiceStore.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using Resend;

namespace CloudServiceStore.Infrastructure.Services;

// Gửi email thật qua Resend (đã xác nhận API bằng reflection trên gói NuGet Resend 0.11.0 thật, không
// đoán theo tài liệu web - bản SDK hiện tại khác đáng kể so với ví dụ hay thấy trên mạng: EmailMessage.
// To/From nhận thẳng string qua implicit operator, không còn .To.Add(...); EmailSendAsync trả về
// ResendResponse<Guid> thay vì void).
// Không throw ra ngoài khi gửi thất bại - giữ đúng hợp đồng ngầm mà mọi call site IEmailService.SendAsync
// trong dự án đã viết theo (LoggingEmailService trước đây không bao giờ throw): 1 lần gửi email lỗi
// (Resend rate limit/API down...) không được phép làm hỏng cả giao dịch nghiệp vụ đang chạy kèm nó (vd
// OrderRequestStatusTransitionService.TransitionAsync gọi Observer rồi mới SaveChanges - email throw sẽ
// làm mất luôn cả việc lưu đổi trạng thái đơn).
public class ResendEmailService : IEmailService
{
    private readonly IResend _resend;
    private readonly IAppSettings _appSettings;
    private readonly ILogger<ResendEmailService> _logger;

    public ResendEmailService(IResend resend, IAppSettings appSettings, ILogger<ResendEmailService> logger)
    {
        _resend = resend;
        _appSettings = appSettings;
        _logger = logger;
    }

    public async Task SendAsync(string toEmail, string subject, string body, CancellationToken cancellationToken = default)
    {
        var message = new EmailMessage
        {
            From = new EmailAddress { Email = _appSettings.EmailFromAddress, DisplayName = _appSettings.EmailFromName },
            To = toEmail,
            Subject = subject,
            TextBody = body
        };

        try
        {
            var response = await _resend.EmailSendAsync(message, cancellationToken);
            if (!response.Success)
            {
                _logger.LogWarning(
                    "Gửi email qua Resend thất bại (to={ToEmail}, subject={Subject}): {Error}",
                    toEmail, subject, response.Exception?.Message);
            }
        }
        catch (ResendException ex)
        {
            _logger.LogWarning(ex, "Gửi email qua Resend thất bại (to={ToEmail}, subject={Subject})", toEmail, subject);
        }
    }
}
