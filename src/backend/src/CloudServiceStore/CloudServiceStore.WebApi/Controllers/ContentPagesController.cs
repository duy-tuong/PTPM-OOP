using CloudServiceStore.Application.Features.Content.ContentPages;
using CloudServiceStore.Application.Features.Content.ContentPages.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/content-pages")]
public class ContentPagesController : ControllerBase
{
    private readonly IContentPageService _service;

    public ContentPagesController(IContentPageService service)
    {
        _service = service;
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<ContentPageDto>> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetBySlugAsync(slug, cancellationToken));
    }
}
