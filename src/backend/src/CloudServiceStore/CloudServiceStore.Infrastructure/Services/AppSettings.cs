using CloudServiceStore.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace CloudServiceStore.Infrastructure.Services;

// Application layer không tham chiếu Microsoft.Extensions.Configuration trực tiếp (đúng Clean
// Architecture) - đọc IConfiguration ở đây (Infrastructure), expose ra Application qua IAppSettings,
// mirror đúng cách LocalFileStorageService đọc Storage:UploadsPath.
public class AppSettings : IAppSettings
{
    public string PublicBaseUrl { get; }
    public string BankName { get; }
    public string BankAccountNumber { get; }
    public string BankAccountHolder { get; }
    public int ProvisioningDelaySeconds { get; }
    public int ProvisioningCompletionDelaySeconds { get; }
    public int RenewalReminderLeadDays { get; }

    public AppSettings(IConfiguration configuration)
    {
        PublicBaseUrl = configuration["App:PublicBaseUrl"]?.TrimEnd('/') ?? string.Empty;
        // Số TK/ngân hàng giả lập cho mô phỏng chuyển khoản - không phải tài khoản thật, chỉ hiển thị
        // ở trang /thanh-toan/{orderCode} để khách "chuyển khoản" rồi Admin xác nhận tay đã nhận tiền.
        BankName = configuration["App:BankName"] ?? string.Empty;
        BankAccountNumber = configuration["App:BankAccountNumber"] ?? string.Empty;
        BankAccountHolder = configuration["App:BankAccountHolder"] ?? string.Empty;
        // Độ trễ (giây) OrderAutoProvisioningBackgroundService chờ trước khi tự chuyển Paid->Provisioning
        // và Provisioning->Completed - mặc định 30s/30s, đủ nhanh để thấy được lúc demo/chấm bài, không
        // phải hạ tầng thật nên không cần độ trễ thực tế (hàng giờ/ngày) như nhà cung cấp thật.
        ProvisioningDelaySeconds = int.TryParse(configuration["App:ProvisioningDelaySeconds"], out var delay) ? delay : 30;
        ProvisioningCompletionDelaySeconds = int.TryParse(configuration["App:ProvisioningCompletionDelaySeconds"], out var completionDelay) ? completionDelay : 30;
        // Số ngày trước khi hết hạn thì RenewalReminderBackgroundService gửi email nhắc gia hạn (Tier 4)
        // - mặc định 7 ngày, đủ sớm để khách kịp gia hạn trước khi dịch vụ gián đoạn.
        RenewalReminderLeadDays = int.TryParse(configuration["App:RenewalReminderLeadDays"], out var leadDays) ? leadDays : 7;
    }
}
