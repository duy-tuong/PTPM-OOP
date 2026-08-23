using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Admin.Payments.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/payments")]
[Authorize(Roles = "Admin")]
public class AdminPaymentsController : ControllerBase
{
    private readonly IPaymentGatewayService _paymentGatewayService;

    public AdminPaymentsController(IPaymentGatewayService paymentGatewayService)
    {
        _paymentGatewayService = paymentGatewayService;
    }

    // Thao tác 1 lần Admin tự bấm sau khi deploy có domain/HTTPS thật (hoặc qua tunnel ngrok lúc test,
    // xem plan Phần T) - đăng ký URL webhook với PayOS để họ bắt đầu gửi thông báo thanh toán về.
    // KHÔNG tự động hoá lúc Program.cs khởi động: URL webhook phụ thuộc domain/tunnel chưa cố định lúc
    // biên dịch code, tự động hoá sẽ chỉ gây gọi confirm-webhook sai URL mỗi lần container khởi động
    // lại trước khi có domain thật.
    [HttpPost("confirm-webhook")]
    public async Task<IActionResult> ConfirmWebhook(ConfirmWebhookRequestDto dto, CancellationToken cancellationToken)
    {
        await _paymentGatewayService.ConfirmWebhookUrlAsync(dto.WebhookUrl, cancellationToken);
        return Ok();
    }
}
