using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Content.Faqs;
using CloudServiceStore.Application.Features.Admin.Content.Faqs.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/faqs")]
[Authorize(Roles = "Admin,Editor")]
public class AdminFaqsController : ControllerBase
{
    private readonly IAdminFaqService _service;

    public AdminFaqsController(IAdminFaqService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminFaqDto>>> GetList([FromQuery] FaqQueryParams query, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(query, cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<AdminFaqDto>> Create(CreateFaqDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetList), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AdminFaqDto>> Update(int id, UpdateFaqDto dto, CancellationToken cancellationToken)
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
