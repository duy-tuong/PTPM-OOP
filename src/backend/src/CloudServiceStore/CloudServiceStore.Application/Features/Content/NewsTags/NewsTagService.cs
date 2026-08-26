using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Content.NewsTags.Dtos;
using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Content.NewsTags;

public class NewsTagService : INewsTagService
{
    private readonly IUnitOfWork _unitOfWork;

    public NewsTagService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<NewsTagDto>> GetListAsync(int take = 20, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<NewsTag, int>();
        var now = DateTime.UtcNow;

        return await repository.Query()
            .Select(t => new NewsTagDto
            {
                Id = t.Id,
                Name = t.Name,
                Slug = t.Slug,
                ArticleCount = t.ArticleTags.Count(at => at.NewsArticle.IsPublished && at.NewsArticle.PublishedAt <= now)
            })
            .Where(t => t.ArticleCount > 0)
            .OrderByDescending(t => t.ArticleCount)
            .Take(take)
            .ToListAsync(cancellationToken);
    }
}
