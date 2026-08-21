using System.IdentityModel.Tokens.Jwt;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Content.NewsArticles;
using CloudServiceStore.Application.Features.Admin.Content.NewsArticles.Dtos;
using CloudServiceStore.Application.Features.Content.NewsArticles.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/news-articles")]
[Authorize(Roles = "Admin,Editor")]
public class AdminNewsArticlesController : ControllerBase
{
    private readonly IAdminNewsArticleService _service;

    public AdminNewsArticlesController(IAdminNewsArticleService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminNewsArticleDto>>> GetList([FromQuery] NewsArticleQueryParams query, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(query, cancellationToken));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AdminNewsArticleDto>> GetById(int id, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetByIdAsync(id, cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<AdminNewsArticleDto>> Create(CreateNewsArticleDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, GetUserId(), cancellationToken);
        return CreatedAtAction(nameof(Create), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AdminNewsArticleDto>> Update(int id, UpdateNewsArticleDto dto, CancellationToken cancellationToken)
    {
        return Ok(await _service.UpdateAsync(id, dto, cancellationToken));
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
