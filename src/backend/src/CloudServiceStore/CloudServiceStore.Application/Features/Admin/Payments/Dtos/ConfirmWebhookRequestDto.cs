using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Admin.Payments.Dtos;

// Admin tự nhập webhookUrl (không suy ra từ IAppSettings.PublicBaseUrl) - vì PublicBaseUrl trỏ tới
// FRONTEND (dùng cho link /thanh-toan/{orderCode} trong email), còn webhook cần trỏ tới BACKEND
// (/api/order-requests/payos-webhook), và lúc test trước khi có domain thật còn cần trỏ qua tunnel
// ngrok tạm thời (xem plan Phần T) - không có 1 URL cố định nào suy ra tự động được ở mọi giai đoạn.
public class ConfirmWebhookRequestDto
{
    [Required, Url]
    public string WebhookUrl { get; set; } = string.Empty;
}
