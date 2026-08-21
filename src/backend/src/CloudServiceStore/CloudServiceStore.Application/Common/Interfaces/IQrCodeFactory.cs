namespace CloudServiceStore.Application.Common.Interfaces;

public interface IQrCodeFactory
{
    // Sinh mã QR cho 1 gói dịch vụ, trả về data URI (data:image/png;base64,...) để lưu thẳng
    // vào ServicePlan.QrCodeUrl và dùng trực tiếp làm <img src="..."> ở frontend.
    string GenerateForServicePlan(int planId, string planSlug);
}
