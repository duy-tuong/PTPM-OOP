using System.IdentityModel.Tokens.Jwt;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Content.ContentPages;
using CloudServiceStore.Application.Features.Admin.Content.ContentPages.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/content-pages")]
[Authorize(Roles = "Admin,Editor")]
public class AdminContentPagesController : ControllerBase
{
    private readonly IAdminContentPageService _service;

    public AdminContentPagesController(IAdminContentPageService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminContentPageDto>>> GetList([FromQuery] ContentPageQueryParams query, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(query, cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<AdminContentPageDto>> Create(CreateContentPageDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, GetUserId(), cancellationToken);
        return CreatedAtAction(nameof(GetList), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AdminContentPageDto>> Update(int id, UpdateContentPageDto dto, CancellationToken cancellationToken)
    {
        return Ok(await _service.UpdateAsync(id, dto, cancellationToken));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _service.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    private Guid GetUserId()
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        return Guid.Parse(sub!);
    }
}
