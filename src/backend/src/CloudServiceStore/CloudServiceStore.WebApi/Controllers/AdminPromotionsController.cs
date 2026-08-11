using CloudServiceStore.Application.Features.Admin.Marketing.Promotions;
using CloudServiceStore.Application.Features.Admin.Marketing.Promotions.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/promotions")]
[Authorize(Roles = "Admin")]
public class AdminPromotionsController : ControllerBase
{
    private readonly IAdminPromotionService _service;

    public AdminPromotionsController(IAdminPromotionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminPromotionDto>>> GetList(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<AdminPromotionDto>> Create(CreatePromotionDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetList), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AdminPromotionDto>> Update(int id, UpdatePromotionDto dto, CancellationToken cancellationToken)
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
