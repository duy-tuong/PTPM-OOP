using CloudServiceStore.Application.Features.Content.ContentPages.Dtos;

namespace CloudServiceStore.Application.Features.Content.ContentPages;

public interface IContentPageService
{
    Task<ContentPageDto> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
}
