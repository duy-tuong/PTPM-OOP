using System.Security.Cryptography;
using CloudServiceStore.Application.Common.Interfaces;

namespace CloudServiceStore.Infrastructure.Services;

// Stateless - mirror IQrCodeFactory (đăng ký Singleton, không giữ state giữa các lần gọi).
public class FakeProvisioningGenerator : IFakeProvisioningGenerator
{
    // RFC 5737 "TEST-NET" - 3 dải IPv4 IANA dành riêng cho tài liệu/ví dụ, đảm bảo KHÔNG BAO GIỜ là
    // IP thật được định tuyến trên Internet - an toàn tuyệt đối để hiển thị "IP giả lập" mà không cần
    // hạ tầng ngoài hay lo trùng với địa chỉ thật của ai.
    private static readonly string[] DocumentationRangePrefixes = ["192.0.2.", "198.51.100.", "203.0.113."];

    // Bỏ ký tự dễ nhầm lẫn khi đọc (0/O, 1/l/I) - mật khẩu này chỉ để hiển thị demo, không phải sinh
    // để nhập tự động, nên ưu tiên dễ đọc hơn là tối đa hoá entropy.
    private const string PasswordCharset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
    private const int PasswordLength = 16;

    public (string IpAddress, string? RootPassword) GenerateServerCredentials(bool hasSshKey)
    {
        var prefix = DocumentationRangePrefixes[RandomNumberGenerator.GetInt32(DocumentationRangePrefixes.Length)];
        // Octet cuối 2-254 (tránh .0 network và .255 broadcast trông giống địa chỉ đặc biệt).
        var hostOctet = RandomNumberGenerator.GetInt32(2, 255);
        var ipAddress = $"{prefix}{hostOctet}";
        // hasSshKey=true - không sinh mật khẩu (khách đăng nhập bằng SSH key, xem OrderRequestItem.
        // SshPublicKeySnapshot).
        var rootPassword = hasSshKey ? null : RandomNumberGenerator.GetString(PasswordCharset, PasswordLength);
        return (ipAddress, rootPassword);
    }

    // Cố định, không random - nhà cung cấp domain thật dùng chung 1 cặp nameserver cho cả cụm khách
    // hàng, không sinh ngẫu nhiên theo từng đơn.
    public string GenerateNameservers() => "ns1.cloudverse.vn, ns2.cloudverse.vn";
}
