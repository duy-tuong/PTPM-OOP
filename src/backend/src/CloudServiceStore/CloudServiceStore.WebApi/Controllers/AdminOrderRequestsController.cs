using System.IdentityModel.Tokens.Jwt;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Sales.OrderRequests;
using CloudServiceStore.Application.Features.Admin.Sales.OrderRequests.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/order-requests")]
[Authorize(Roles = "Admin,Editor")]
public class AdminOrderRequestsController : ControllerBase
{
    private readonly IAdminOrderRequestService _service;

    public AdminOrderRequestsController(IAdminOrderRequestService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminOrderRequestDto>>> GetList([FromQuery] OrderRequestQueryParams query, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(query, cancellationToken));
    }

    [HttpPut("{id:int}/status")]
    public async Task<ActionResult<AdminOrderRequestDto>> UpdateStatus(int id, UpdateOrderRequestStatusDto dto, CancellationToken cancellationToken)
    {
        return Ok(await _service.UpdateStatusAsync(id, dto, GetUserId(), cancellationToken));
    }

    private Guid GetUserId()
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        return Guid.Parse(sub!);
    }
}
