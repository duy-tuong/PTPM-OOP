using CloudServiceStore.Application.Common.Interfaces;
using QRCoder;

namespace CloudServiceStore.Infrastructure.Services;

// Factory Method pattern: nơi duy nhất biết cách "tạo ra" 1 mã QR (chọn nội dung encode, mức sửa lỗi,
// định dạng ảnh...) — nơi gọi (Application service khi CRUD ServicePlan) chỉ cần biết interface
// IQrCodeFactory, không cần quan tâm QRCoder được dùng như thế nào bên dưới.
public class QrCodeFactory : IQrCodeFactory
{
    private const string BaseUrl = "https://cloudservicestore.local/plans";

    public string GenerateForServicePlan(int planId, string planSlug)
    {
        var targetUrl = $"{BaseUrl}/{planSlug}";
        return GenerateFromContent(targetUrl);
    }

    public string GenerateFromContent(string content)
    {
        using var generator = new QRCodeGenerator();
        using var qrCodeData = generator.CreateQrCode(content, QRCodeGenerator.ECCLevel.Q);
        using var pngQrCode = new PngByteQRCode(qrCodeData);
        var pngBytes = pngQrCode.GetGraphic(20);

        return $"data:image/png;base64,{Convert.ToBase64String(pngBytes)}";
    }
}
