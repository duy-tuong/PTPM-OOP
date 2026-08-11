using CloudServiceStore.Application.Features.Admin.Content.NewsArticles.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Content.NewsArticles;

public interface IAdminNewsArticleService
{
    Task<AdminNewsArticleDto> CreateAsync(CreateNewsArticleDto dto, Guid authorId, CancellationToken cancellationToken = default);

    Task<AdminNewsArticleDto> UpdateAsync(int id, UpdateNewsArticleDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
