using CloudServiceStore.Application.Features.Content.Faqs;
using CloudServiceStore.Application.Features.Content.Faqs.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/faqs")]
public class FaqsController : ControllerBase
{
    private readonly IFaqService _service;

    public FaqsController(IFaqService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<FaqDto>>> GetList([FromQuery] int? serviceCategoryId, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(serviceCategoryId, cancellationToken));
    }
}
