using CloudServiceStore.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.Services;

// Dự án chưa có SMTP/dịch vụ gửi email thật - giả lập bằng cách ghi log (đủ để demo/nộp bài xem link
// xác thực/đặt lại mật khẩu qua console). Đăng ký qua interface IEmailService nên sau này thay bằng
// SmtpEmailService thật chỉ cần đổi 1 dòng DI ở DependencyInjection.cs, không đụng code nghiệp vụ.
public class LoggingEmailService : IEmailService
{
    private readonly ILogger<LoggingEmailService> _logger;

    public LoggingEmailService(ILogger<LoggingEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendAsync(string toEmail, string subject, string body, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[Email giả lập] To: {ToEmail} | Subject: {Subject}\n{Body}", toEmail, subject, body);
        return Task.CompletedTask;
    }
}
