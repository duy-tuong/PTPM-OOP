using CloudServiceStore.Application.Features.Content.NewsComments.Dtos;

namespace CloudServiceStore.Application.Features.Content.NewsComments;

public interface INewsCommentService
{
    Task<List<NewsCommentDto>> GetForArticleAsync(int newsArticleId, CancellationToken cancellationToken = default);

    Task<NewsCommentDto> CreateAsync(CreateNewsCommentDto dto, Guid? customerId, CancellationToken cancellationToken = default);
}
