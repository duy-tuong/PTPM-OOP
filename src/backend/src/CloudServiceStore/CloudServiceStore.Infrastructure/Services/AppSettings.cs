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

    public AppSettings(IConfiguration configuration)
    {
        PublicBaseUrl = configuration["App:PublicBaseUrl"]?.TrimEnd('/') ?? string.Empty;
        // Số TK/ngân hàng giả lập cho mô phỏng chuyển khoản - không phải tài khoản thật, chỉ hiển thị
        // ở trang /thanh-toan/{orderCode} để khách "chuyển khoản" rồi Admin xác nhận tay đã nhận tiền.
        BankName = configuration["App:BankName"] ?? string.Empty;
        BankAccountNumber = configuration["App:BankAccountNumber"] ?? string.Empty;
        BankAccountHolder = configuration["App:BankAccountHolder"] ?? string.Empty;
    }
}
