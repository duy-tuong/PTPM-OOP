using System.IdentityModel.Tokens.Jwt;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Sales.ConsultationRequests;
using CloudServiceStore.Application.Features.Sales.ConsultationRequests.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

// Công khai, KHÔNG [Authorize] - xem comment OrderRequestsController.cs (cùng lý do, cùng cách gán
// CustomerId khi khách đã đăng nhập với role "Customer").
[ApiController]
[Route("api/consultation-requests")]
public class ConsultationRequestsController : ControllerBase
{
    private readonly IConsultationRequestService _service;

    public ConsultationRequestsController(IConsultationRequestService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult<ConsultationRequestDto>> Create(CreateConsultationRequestDto dto, CancellationToken cancellationToken)
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
    public async Task<ActionResult<PagedResult<MyConsultationRequestDto>>> GetMine([FromQuery] PaginationParams query, CancellationToken cancellationToken)
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        var customerId = Guid.Parse(sub!);
        return Ok(await _service.GetMineAsync(customerId, query, cancellationToken));
    }
}
