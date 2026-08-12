using System.IdentityModel.Tokens.Jwt;
using CloudServiceStore.Application.Features.Admin.Sales.ConsultationRequests;
using CloudServiceStore.Application.Features.Admin.Sales.ConsultationRequests.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/consultation-requests")]
[Authorize(Roles = "Admin,Editor")]
public class AdminConsultationRequestsController : ControllerBase
{
    private readonly IAdminConsultationRequestService _service;

    public AdminConsultationRequestsController(IAdminConsultationRequestService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminConsultationRequestDto>>> GetList(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(cancellationToken));
    }

    [HttpPut("{id:int}/status")]
    public async Task<ActionResult<AdminConsultationRequestDto>> UpdateStatus(int id, UpdateConsultationRequestStatusDto dto, CancellationToken cancellationToken)
    {
        return Ok(await _service.UpdateStatusAsync(id, dto, GetUserId(), cancellationToken));
    }

    private Guid GetUserId()
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        return Guid.Parse(sub!);
    }
}
