using System.IdentityModel.Tokens.Jwt;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Sales.OrderRequests;
using CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

// Công khai, KHÔNG [Authorize] - đúng tiền lệ ConsultationRequestsController/AffiliateApplicationsController
// (dự án chưa có captcha/rate-limit, chấp nhận rủi ro thấp cho quy mô BTL). Nếu khách đã đăng nhập
// (Bearer token hợp lệ + role "Customer") thì gán CustomerId để sau này liệt kê được ở /order-requests/mine
// - kiểm tra thêm IsInRole("Customer") (khác NewsCommentsController chỉ check IsAuthenticated) vì JWT
// khách hàng và nhân viên dùng chung 1 scheme/key, chỉ khác claim Role.
[ApiController]
[Route("api/order-requests")]
public class OrderRequestsController : ControllerBase
{
    private readonly IOrderRequestService _service;

    public OrderRequestsController(IOrderRequestService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult<OrderRequestDto>> Create(CreateOrderRequestDto dto, CancellationToken cancellationToken)
    {
        Guid? customerId = null;
        if (User.Identity?.IsAuthenticated == true && User.IsInRole("Customer"))
        {
            var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (Guid.TryParse(sub, out var parsed))
            {
                customerId = parsed;
            }
        }

        var result = await _service.CreateAsync(dto, customerId, cancellationToken);
        return CreatedAtAction(nameof(Create), new { id = result.Id }, result);
    }

    [HttpGet("mine")]
    [Authorize(Roles = "Customer")]
    public async Task<ActionResult<PagedResult<MyOrderRequestDto>>> GetMine([FromQuery] PaginationParams query, CancellationToken cancellationToken)
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        var customerId = Guid.Parse(sub!);
        return Ok(await _service.GetMineAsync(customerId, query, cancellationToken));
    }

    // Công khai (không [Authorize]) - dùng cho trang /thanh-toan/{orderCode} mà link đã gửi qua email
    // xác nhận đơn hàng có thể mở lại được mà không cần đăng nhập.
    [HttpGet("by-code/{orderCode}")]
    public async Task<ActionResult<OrderLookupDto>> GetByCode(string orderCode, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetByCodeAsync(orderCode, cancellationToken));
    }
}
