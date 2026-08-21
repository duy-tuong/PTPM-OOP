using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Content.NewsArticles.Dtos;
using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Content.NewsArticles;

public class NewsArticleService : INewsArticleService
{
    private readonly IUnitOfWork _unitOfWork;

    public NewsArticleService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<NewsArticleListItemDto>> GetListAsync(NewsArticleQueryParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<NewsArticle, int>();
        var now = DateTime.UtcNow;
        var search = query.Search;

        var baseQuery = repository.Query()
            .Include(a => a.NewsCategory)
            .Include(a => a.ArticleTags).ThenInclude(at => at.Tag)
            .Where(a => a.IsPublished
                && a.PublishedAt <= now
                && (query.CategorySlug == null || a.NewsCategory.Slug == query.CategorySlug)
                && (query.TagSlug == null || a.ArticleTags.Any(at => at.Tag.Slug == query.TagSlug))
                && (search == null || a.Title.Contains(search) || (a.Summary != null && a.Summary.Contains(search))))
            .OrderByDescending(a => a.PublishedAt);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(a => new NewsArticleListItemDto
        {
            Id = a.Id,
            Title = a.Title,
            Slug = a.Slug,
            Summary = a.Summary,
            ThumbnailUrl = a.ThumbnailUrl,
            PublishedAt = a.PublishedAt,
            ViewCount = a.ViewCount,
            CategoryName = a.NewsCategory.Name,
            CategorySlug = a.NewsCategory.Slug,
            Tags = a.ArticleTags.Select(at => at.Tag.Name).ToList()
        }).ToList();

        return PagedResult<NewsArticleListItemDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<NewsArticleDetailDto> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<NewsArticle, int>();
        var now = DateTime.UtcNow;

        var entity = await repository.Query()
            .Include(a => a.NewsCategory)
            .Include(a => a.ArticleTags).ThenInclude(at => at.Tag)
            .FirstOrDefaultAsync(a => a.Slug == slug && a.IsPublished && a.PublishedAt <= now, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(NewsArticle), slug);
        }

        entity.ViewCount++;
        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new NewsArticleDetailDto
        {
            Id = entity.Id,
            Title = entity.Title,
            Slug = entity.Slug,
            Summary = entity.Summary,
            Content = entity.Content,
            ThumbnailUrl = entity.ThumbnailUrl,
            PublishedAt = entity.PublishedAt,
            ViewCount = entity.ViewCount,
            CategoryName = entity.NewsCategory.Name,
            CategorySlug = entity.NewsCategory.Slug,
            Tags = entity.ArticleTags.Select(at => at.Tag.Name).ToList()
        };
    }
}
