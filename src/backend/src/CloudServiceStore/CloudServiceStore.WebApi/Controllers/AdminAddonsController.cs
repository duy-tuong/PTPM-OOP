using CloudServiceStore.Application.Features.Admin.Catalog.Addons;
using CloudServiceStore.Application.Features.Admin.Catalog.Addons.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/addons")]
[Authorize(Roles = "Admin")]
public class AdminAddonsController : ControllerBase
{
    private readonly IAdminAddonService _service;

    public AdminAddonsController(IAdminAddonService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminAddonDto>>> GetList(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(cancellationToken));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AdminAddonDto>> GetById(int id, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetByIdAsync(id, cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<AdminAddonDto>> Create(CreateAddonDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AdminAddonDto>> Update(int id, UpdateAddonDto dto, CancellationToken cancellationToken)
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
