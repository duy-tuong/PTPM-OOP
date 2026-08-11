using CloudServiceStore.Application.Features.Admin.Catalog.ServicePlans;
using CloudServiceStore.Application.Features.Admin.Catalog.ServicePlans.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/service-plans")]
[Authorize(Roles = "Admin")]
public class AdminServicePlansController : ControllerBase
{
    private readonly IAdminServicePlanService _service;

    public AdminServicePlansController(IAdminServicePlanService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult<AdminServicePlanDto>> Create(CreateServicePlanDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(Create), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AdminServicePlanDto>> Update(int id, UpdateServicePlanDto dto, CancellationToken cancellationToken)
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
