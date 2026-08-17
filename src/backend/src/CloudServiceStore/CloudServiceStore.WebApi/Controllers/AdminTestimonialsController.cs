using CloudServiceStore.Application.Features.Admin.Content.Testimonials;
using CloudServiceStore.Application.Features.Admin.Content.Testimonials.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/testimonials")]
[Authorize(Roles = "Admin,Editor")]
public class AdminTestimonialsController : ControllerBase
{
    private readonly IAdminTestimonialService _service;

    public AdminTestimonialsController(IAdminTestimonialService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminTestimonialDto>>> GetList(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<AdminTestimonialDto>> Create(CreateTestimonialDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetList), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AdminTestimonialDto>> Update(int id, UpdateTestimonialDto dto, CancellationToken cancellationToken)
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
