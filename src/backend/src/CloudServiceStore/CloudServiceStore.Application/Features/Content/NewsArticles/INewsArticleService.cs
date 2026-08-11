using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Content.NewsArticles.Dtos;

namespace CloudServiceStore.Application.Features.Content.NewsArticles;

public interface INewsArticleService
{
    Task<PagedResult<NewsArticleListItemDto>> GetListAsync(NewsArticleQueryParams query, CancellationToken cancellationToken = default);

    Task<NewsArticleDetailDto> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
}
