using System.IdentityModel.Tokens.Jwt;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Sales.OrderRequests;
using CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

// Đặt hàng bắt buộc đăng nhập (role "Customer") - đơn luôn gắn CustomerId, không còn luồng ẩn danh.
// Lý do: toàn bộ giá trị hậu-mãi (Tier 3 xem lại IP/mật khẩu bàn giao, Tier 4 tự gia hạn) đều đứng sau
// đăng nhập - khách mua ẩn danh trước đây mất quyền truy cập vĩnh viễn nếu lỡ mất email xác nhận. Chỉ
// GetByCode (tra cứu theo mã, dùng cho link email) vẫn công khai.
[ApiController]
[Route("api/order-requests")]
public class OrderRequestsController : ControllerBase
{
    private readonly IOrderRequestService _service;
    private readonly IPlanChangeService _planChangeService;

    public OrderRequestsController(IOrderRequestService service, IPlanChangeService planChangeService)
    {
        _service = service;
        _planChangeService = planChangeService;
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<ActionResult<OrderRequestDto>> Create(CreateOrderRequestDto dto, CancellationToken cancellationToken)
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        var customerId = Guid.Parse(sub!);
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

    // Gia hạn (Tier 4) - luôn đòi hỏi đăng nhập (khác Create, không có luồng ẩn danh) vì cần biết
    // đúng chủ đơn để kiểm tra quyền sở hữu item gốc + tự điền thông tin khách hàng từ hồ sơ.
    [HttpPost("mine/renewals")]
    [Authorize(Roles = "Customer")]
    public async Task<ActionResult<OrderRequestDto>> CreateRenewal(CreateRenewalOrderRequestDto dto, CancellationToken cancellationToken)
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        var customerId = Guid.Parse(sub!);
        var result = await _service.CreateRenewalAsync(dto, customerId, cancellationToken);
        return CreatedAtAction(nameof(Create), new { id = result.Id }, result);
    }

    // Tier 4 - "Dịch vụ của tôi": danh sách dịch vụ đang sống (không phải lịch sử đơn hàng) để khách
    // thấy ExpiresAt + bấm gia hạn.
    [HttpGet("mine/services")]
    [Authorize(Roles = "Customer")]
    public async Task<ActionResult<PagedResult<MyServiceItemDto>>> GetMyServices([FromQuery] PaginationParams query, CancellationToken cancellationToken)
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        var customerId = Guid.Parse(sub!);
        return Ok(await _service.GetMyServicesAsync(customerId, query, cancellationToken));
    }

    // Đổi gói (Phần 6) - Preview trả AmountDue để khách xác nhận trước khi thực sự đổi, không ghi gì
    // xuống DB.
    [HttpPost("items/{itemId}/change-plan/preview")]
    [Authorize(Roles = "Customer")]
    public async Task<ActionResult<PlanChangePreviewDto>> PreviewChangePlan(int itemId, RequestPlanChangeDto dto, CancellationToken cancellationToken)
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        var customerId = Guid.Parse(sub!);
        return Ok(await _planChangeService.PreviewChangeAsync(itemId, dto.TargetPlanId, customerId, cancellationToken));
    }

    [HttpPost("items/{itemId}/change-plan")]
    [Authorize(Roles = "Customer")]
    public async Task<ActionResult<PlanChangeResultDto>> ChangePlan(int itemId, RequestPlanChangeDto dto, CancellationToken cancellationToken)
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        var customerId = Guid.Parse(sub!);
        return Ok(await _planChangeService.RequestChangeAsync(itemId, dto.TargetPlanId, customerId, cancellationToken));
    }
}
