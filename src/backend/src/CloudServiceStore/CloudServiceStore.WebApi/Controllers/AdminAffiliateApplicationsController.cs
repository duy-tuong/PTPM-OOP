using System.IdentityModel.Tokens.Jwt;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Sales.AffiliateApplications;
using CloudServiceStore.Application.Features.Admin.Sales.AffiliateApplications.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/affiliate-applications")]
[Authorize(Roles = "Admin,Editor")]
public class AdminAffiliateApplicationsController : ControllerBase
{
    private readonly IAdminAffiliateApplicationService _service;

    public AdminAffiliateApplicationsController(IAdminAffiliateApplicationService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminAffiliateApplicationDto>>> GetList([FromQuery] AffiliateApplicationQueryParams query, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(query, cancellationToken));
    }

    [HttpPut("{id:int}/status")]
    public async Task<ActionResult<AdminAffiliateApplicationDto>> UpdateStatus(int id, UpdateAffiliateApplicationStatusDto dto, CancellationToken cancellationToken)
    {
        return Ok(await _service.UpdateStatusAsync(id, dto, GetUserId(), cancellationToken));
    }

    private Guid GetUserId()
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        return Guid.Parse(sub!);
    }
}
