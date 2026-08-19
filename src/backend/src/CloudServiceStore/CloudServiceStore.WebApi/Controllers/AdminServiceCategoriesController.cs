using CloudServiceStore.Application.Features.Admin.Catalog.ServiceCategories;
using CloudServiceStore.Application.Features.Admin.Catalog.ServiceCategories.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/service-categories")]
[Authorize(Roles = "Admin,Editor")]
public class AdminServiceCategoriesController : ControllerBase
{
    private readonly IAdminServiceCategoryService _service;

    public AdminServiceCategoriesController(IAdminServiceCategoryService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminServiceCategoryDto>>> GetList(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(cancellationToken));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AdminServiceCategoryDto>> Create(CreateServiceCategoryDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetList), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AdminServiceCategoryDto>> Update(int id, UpdateServiceCategoryDto dto, CancellationToken cancellationToken)
    {
        return Ok(await _service.UpdateAsync(id, dto, cancellationToken));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _service.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
