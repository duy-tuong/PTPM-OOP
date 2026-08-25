using CloudServiceStore.Application.Features.Admin.Catalog.OsImages;
using CloudServiceStore.Application.Features.Admin.Catalog.OsImages.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/os-images")]
[Authorize(Roles = "Admin")]
public class AdminOsImagesController : ControllerBase
{
    private readonly IAdminOsImageService _service;

    public AdminOsImagesController(IAdminOsImageService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminOsImageDto>>> GetList(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(cancellationToken));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AdminOsImageDto>> GetById(int id, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetByIdAsync(id, cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<AdminOsImageDto>> Create(CreateOsImageDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AdminOsImageDto>> Update(int id, UpdateOsImageDto dto, CancellationToken cancellationToken)
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
