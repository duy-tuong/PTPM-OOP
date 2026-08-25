namespace CloudServiceStore.Application.Features.Customers.SshKeys.Dtos;

public class CustomerSshKeyDto
{
    public int Id { get; init; }
    public string Label { get; init; } = string.Empty;
    // Trả nguyên public key - key CÔNG KHAI, không phải bí mật cần che (khác PublicKey không chứa gì
    // nhạy cảm nếu lộ, chỉ private key mới cần bảo vệ - khách cần thấy đủ nội dung để đối chiếu).
    public string PublicKey { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}
