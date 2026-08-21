using CloudServiceStore.Application.Features.Content.Testimonials;
using CloudServiceStore.Application.Features.Content.Testimonials.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/testimonials")]
public class TestimonialsController : ControllerBase
{
    private readonly ITestimonialService _service;

    public TestimonialsController(ITestimonialService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<TestimonialDto>>> GetList(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(cancellationToken));
    }
}
