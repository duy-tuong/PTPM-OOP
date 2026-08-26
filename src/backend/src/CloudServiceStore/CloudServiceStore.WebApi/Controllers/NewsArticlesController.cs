using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Content.NewsArticles;
using CloudServiceStore.Application.Features.Content.NewsArticles.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/news-articles")]
public class NewsArticlesController : ControllerBase
{
    private readonly INewsArticleService _service;

    public NewsArticlesController(INewsArticleService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<NewsArticleListItemDto>>> GetList([FromQuery] NewsArticleQueryParams query, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(query, cancellationToken));
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<NewsArticleDetailDto>> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetBySlugAsync(slug, cancellationToken));
    }

    // Tách khỏi GetBySlug (trước đây tăng ViewCount ngay trong đó, không dedup) - dedup thật sự xảy ra
    // ở Route Handler Next.js (cookie httpOnly), endpoint này chỉ đơn thuần +1 mỗi lần được gọi.
    [HttpPost("{slug}/view")]
    public async Task<IActionResult> IncrementView(string slug, CancellationToken cancellationToken)
    {
        await _service.IncrementViewCountAsync(slug, cancellationToken);
        return NoContent();
    }

    [HttpGet("{slug}/related")]
    public async Task<ActionResult<List<NewsArticleListItemDto>>> GetRelated(string slug, [FromQuery] int take = 3, CancellationToken cancellationToken = default)
    {
        return Ok(await _service.GetRelatedAsync(slug, take, cancellationToken));
    }
}
