using CloudServiceStore.Application.Features.Content.NewsTags;
using CloudServiceStore.Application.Features.Content.NewsTags.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/news-tags")]
public class NewsTagsController : ControllerBase
{
    private readonly INewsTagService _service;

    public NewsTagsController(INewsTagService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<NewsTagDto>>> GetList([FromQuery] int take, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(take <= 0 ? 20 : take, cancellationToken));
    }
}
