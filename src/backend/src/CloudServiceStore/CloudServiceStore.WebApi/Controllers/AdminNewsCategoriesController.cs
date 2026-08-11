using CloudServiceStore.Application.Features.Admin.Content.NewsCategories;
using CloudServiceStore.Application.Features.Admin.Content.NewsCategories.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/news-categories")]
[Authorize(Roles = "Admin,Editor")]
public class AdminNewsCategoriesController : ControllerBase
{
    private readonly IAdminNewsCategoryService _service;

    public AdminNewsCategoriesController(IAdminNewsCategoryService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminNewsCategoryDto>>> GetList(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<AdminNewsCategoryDto>> Create(CreateNewsCategoryDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetList), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AdminNewsCategoryDto>> Update(int id, UpdateNewsCategoryDto dto, CancellationToken cancellationToken)
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
