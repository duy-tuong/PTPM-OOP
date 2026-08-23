using CloudServiceStore.Application.Features.Sales.OrderRequests;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

// Công khai, KHÔNG [Authorize] - PayOS gọi endpoint này ẩn danh (server-to-server). Tin cậy dựa vào
// IPaymentGatewayService.VerifyWebhookAsync xác thực chữ ký (HMAC bằng ChecksumKey), không phải bằng
// JWT. Đọc Request.Body dạng raw string (không bind [FromBody] type cụ thể) để giữ đúng ranh giới
// Application không phụ thuộc SDK payOS - xem IPaymentGatewayService/IPaymentWebhookService.
[ApiController]
[Route("api/order-requests")]
public class PaymentWebhooksController : ControllerBase
{
    private readonly IPaymentWebhookService _service;

    public PaymentWebhooksController(IPaymentWebhookService service)
    {
        _service = service;
    }

    [HttpPost("payos-webhook")]
    public async Task<IActionResult> HandlePayOsWebhook(CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(Request.Body);
        var rawBody = await reader.ReadToEndAsync(cancellationToken);

        var outcome = await _service.HandlePayOsWebhookAsync(rawBody, cancellationToken);

        // Chữ ký sai -> 400, không phải lỗi hệ thống nên không throw để tránh PayOS coi là lỗi 5xx và
        // retry vô ích. Mọi trường hợp khác (đơn không tồn tại/đã xử lý rồi/vừa transition) đều trả 200 -
        // PayOS chỉ cần biết webhook đã nhận thành công, retry storm chỉ xảy ra với non-2xx.
        return outcome == PayOsWebhookOutcome.InvalidSignature ? BadRequest() : Ok();
    }
}
