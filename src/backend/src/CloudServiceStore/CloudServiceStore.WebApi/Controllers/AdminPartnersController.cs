using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Content.Partners;
using CloudServiceStore.Application.Features.Admin.Content.Partners.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/partners")]
[Authorize(Roles = "Admin,Editor")]
public class AdminPartnersController : ControllerBase
{
    private readonly IAdminPartnerService _service;

    public AdminPartnersController(IAdminPartnerService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminPartnerDto>>> GetList([FromQuery] PartnerQueryParams query, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(query, cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<AdminPartnerDto>> Create(CreatePartnerDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetList), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AdminPartnerDto>> Update(int id, UpdatePartnerDto dto, CancellationToken cancellationToken)
    {
        return Ok(await _service.UpdateAsync(id, dto, cancellationToken));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _service.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
