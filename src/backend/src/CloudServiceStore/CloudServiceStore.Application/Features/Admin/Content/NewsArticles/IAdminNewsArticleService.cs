using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Content.NewsArticles.Dtos;
using CloudServiceStore.Application.Features.Content.NewsArticles.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Content.NewsArticles;

public interface IAdminNewsArticleService
{
    Task<PagedResult<AdminNewsArticleDto>> GetListAsync(NewsArticleQueryParams query, CancellationToken cancellationToken = default);

    Task<AdminNewsArticleDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<AdminNewsArticleDto> CreateAsync(CreateNewsArticleDto dto, Guid authorId, CancellationToken cancellationToken = default);

    Task<AdminNewsArticleDto> UpdateAsync(int id, UpdateNewsArticleDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
