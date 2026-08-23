using System.Text.Json;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Domain.Entities.Sales;
using PayOS;
using PayOS.Exceptions;
using PayOS.Models;
using PayOS.Models.V2.PaymentRequests;
using PayOS.Models.Webhooks;

namespace CloudServiceStore.Infrastructure.Services;

// Adapter (Infrastructure) cho IPaymentGatewayService (port ở Application) - nơi DUY NHẤT trong dự án
// biết tới SDK payOS. Đã xác nhận trực tiếp bằng reflection trên gói NuGet payOS 2.1.0 thật (không đoán
// từ tài liệu web, vốn có phần không đáng tin - xem ghi chú trong plan): PayOSClient.PaymentRequests.
// CreateAsync/Webhooks.ConfirmAsync/Webhooks.VerifyAsync đúng như dùng dưới đây, và mọi lỗi từ SDK (chữ
// ký sai, request/response không hợp lệ...) đều là PayOSException hoặc lớp con
// (InvalidSignatureException/WebhookException/ApiException) - bắt đúng lớp cha này để phân biệt "lỗi từ
// phía PayOS/dữ liệu" (trả null, caller tự quyết 400) với lỗi hệ thống thật (để bắn lên, caller trả 500).
public class PayOsPaymentGatewayService : IPaymentGatewayService
{
    private readonly PayOSClient _client;
    private readonly string _publicBaseUrl;

    public PayOsPaymentGatewayService(IAppSettings appSettings)
    {
        _client = new PayOSClient(appSettings.PayOsClientId, appSettings.PayOsApiKey, appSettings.PayOsChecksumKey);
        _publicBaseUrl = appSettings.PublicBaseUrl;
    }

    public async Task<PaymentLinkResult> CreatePaymentLinkAsync(OrderRequest order, CancellationToken cancellationToken = default)
    {
        // ExpiredAt bắt buộc set tường minh - đã verify thật (live test): nếu để trống, PayOS trả về
        // response không có ExpiredAt (link không tự hết hạn), khiến logic "link hết hạn thì tạo lại"
        // ở OrderRequestService.GetByCodeAsync không còn ý nghĩa. 30 phút là khung thời gian thanh toán
        // hợp lý cho 1 phiên checkout thật.
        var expiredAt = DateTimeOffset.UtcNow.AddMinutes(30).ToUnixTimeSeconds();

        var request = new CreatePaymentLinkRequest
        {
            // OrderCode gửi PayOS = OrderRequest.Id (int PK, đã duy nhất) - KHÔNG dùng OrderRequest.OrderCode
            // (chuỗi "ORD-yyMMddHHmmss-NN", quá dài so với giới hạn mô tả ngắn của PayOS). LƯU Ý: PayOS
            // coi OrderCode là duy nhất vĩnh viễn phía họ - gọi CreateAsync 2 lần với cùng OrderCode sẽ bị
            // từ chối ("Đơn thanh toán đã tồn tại", đã verify thật) - đây chính là lý do bắt buộc phải
            // cache lại link ở OrderRequestService thay vì gọi lại mỗi lần, và vì sao check "hết hạn" ở
            // đó phải null-safe (không được coi ExpiresAt=null là "hết hạn").
            OrderCode = order.Id,
            Amount = (long)order.TotalPrice,
            Description = $"DH{order.Id}",
            ExpiredAt = expiredAt,
            CancelUrl = BuildPaymentPageUrl(order, "cancelled"),
            ReturnUrl = BuildPaymentPageUrl(order, "success")
        };

        var response = await _client.PaymentRequests.CreateAsync(
            request,
            new RequestOptions<CreatePaymentLinkRequest> { CancellationToken = cancellationToken });

        return new PaymentLinkResult
        {
            CheckoutUrl = response.CheckoutUrl,
            QrCode = response.QrCode,
            PaymentLinkId = response.PaymentLinkId,
            ExpiresAt = response.ExpiredAt is long unixSeconds
                ? DateTimeOffset.FromUnixTimeSeconds(unixSeconds).UtcDateTime
                : null
        };
    }

    public async Task<VerifiedPaymentResult?> VerifyWebhookAsync(string rawJsonBody, CancellationToken cancellationToken = default)
    {
        try
        {
            var webhook = JsonSerializer.Deserialize<Webhook>(rawJsonBody);
            if (webhook is null)
            {
                return null;
            }

            var verified = await _client.Webhooks.VerifyAsync(webhook);

            return new VerifiedPaymentResult
            {
                OrderCode = verified.OrderCode,
                Amount = verified.Amount
            };
        }
        catch (PayOSException)
        {
            // Chữ ký sai / payload không đúng định dạng PayOS mong đợi - không phải lỗi hệ thống, caller
            // (webhook controller) tự quyết trả 400.
            return null;
        }
        catch (JsonException)
        {
            return null;
        }
    }

    public async Task ConfirmWebhookUrlAsync(string webhookUrl, CancellationToken cancellationToken = default)
    {
        await _client.Webhooks.ConfirmAsync(
            webhookUrl,
            new RequestOptions<ConfirmWebhookRequest> { CancellationToken = cancellationToken });
    }

    // ReturnUrl/CancelUrl chỉ để UX hiển thị banner tạm ngay khi khách quay lại trang - KHÔNG dùng để
    // xác nhận đã thanh toán thật (query param phía client có thể bị giả mạo). Trạng thái đơn thật chỉ
    // đổi qua VerifyWebhookAsync ở trên.
    private string BuildPaymentPageUrl(OrderRequest order, string paymentQueryValue) =>
        $"{_publicBaseUrl}/thanh-toan/{order.OrderCode}?payment={paymentQueryValue}";
}
