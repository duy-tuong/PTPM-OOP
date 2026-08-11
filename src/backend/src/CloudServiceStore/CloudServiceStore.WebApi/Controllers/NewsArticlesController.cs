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
}
