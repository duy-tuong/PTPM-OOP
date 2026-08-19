using System.IdentityModel.Tokens.Jwt;
using CloudServiceStore.Application.Features.Admin.System.SiteSettings;
using CloudServiceStore.Application.Features.Admin.System.SiteSettings.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/site-settings")]
[Authorize(Roles = "Admin")]
public class AdminSiteSettingsController : ControllerBase
{
    private readonly IAdminSiteSettingService _service;

    public AdminSiteSettingsController(IAdminSiteSettingService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminSiteSettingDto>>> GetList(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<AdminSiteSettingDto>> Create(CreateSiteSettingDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, GetUserId(), cancellationToken);
        return CreatedAtAction(nameof(GetList), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AdminSiteSettingDto>> Update(int id, UpdateSiteSettingDto dto, CancellationToken cancellationToken)
    {
        return Ok(await _service.UpdateAsync(id, dto, GetUserId(), cancellationToken));
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
