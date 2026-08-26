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

        var filtered = repository.Query()
            .Include(a => a.NewsCategory)
            .Include(a => a.Author)
            .Include(a => a.ArticleTags).ThenInclude(at => at.Tag)
            .Where(a => a.IsPublished
                && a.PublishedAt <= now
                && (query.CategorySlug == null || a.NewsCategory.Slug == query.CategorySlug)
                && (query.TagSlug == null || a.ArticleTags.Any(at => at.Tag.Slug == query.TagSlug))
                && (query.Featured == null || a.IsFeatured == query.Featured)
                && (search == null
                    || a.Title.Contains(search)
                    || (a.Summary != null && a.Summary.Contains(search))
                    || a.ArticleTags.Any(at => at.Tag.Name.Contains(search))));

        // "latest" (mặc định, không truyền sort) giữ nguyên hành vi cũ - hardcode PublishedAt desc.
        var ordered = query.Sort switch
        {
            "oldest" => filtered.OrderBy(a => a.PublishedAt),
            "popular" => filtered.OrderByDescending(a => a.ViewCount).ThenByDescending(a => a.PublishedAt),
            _ => filtered.OrderByDescending(a => a.PublishedAt),
        };

        var totalCount = await ordered.CountAsync(cancellationToken);
        var entities = await ordered
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(MapToListItemDto).ToList();

        return PagedResult<NewsArticleListItemDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<NewsArticleDetailDto> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<NewsArticle, int>();
        var now = DateTime.UtcNow;

        var entity = await repository.Query()
            .Include(a => a.NewsCategory)
            .Include(a => a.Author)
            .Include(a => a.ArticleTags).ThenInclude(at => at.Tag)
            .FirstOrDefaultAsync(a => a.Slug == slug && a.IsPublished && a.PublishedAt <= now, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(NewsArticle), slug);
        }

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
            IsFeatured = entity.IsFeatured,
            AuthorName = entity.Author.FullName,
            WordCount = CountWords(entity.Content),
            CategoryName = entity.NewsCategory.Name,
            CategorySlug = entity.NewsCategory.Slug,
            Tags = entity.ArticleTags.Select(at => at.Tag.Name).ToList()
        };
    }

    public async Task IncrementViewCountAsync(string slug, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<NewsArticle, int>();
        var now = DateTime.UtcNow;

        var entity = await repository.Query()
            .FirstOrDefaultAsync(a => a.Slug == slug && a.IsPublished && a.PublishedAt <= now, cancellationToken);
        if (entity is null)
        {
            // Tracking phụ, không được làm hỏng trải nghiệm đọc bài - no-op nếu slug không khớp.
            return;
        }

        entity.ViewCount++;
        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<NewsArticleListItemDto>> GetRelatedAsync(string slug, int take = 3, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<NewsArticle, int>();
        var now = DateTime.UtcNow;

        var current = await repository.Query()
            .Include(a => a.ArticleTags)
            .FirstOrDefaultAsync(a => a.Slug == slug && a.IsPublished && a.PublishedAt <= now, cancellationToken);
        if (current is null)
        {
            throw new NotFoundException(nameof(NewsArticle), slug);
        }

        var tagIds = current.ArticleTags.Select(at => at.TagId).ToList();

        var candidates = await repository.Query()
            .Include(a => a.NewsCategory)
            .Include(a => a.Author)
            .Include(a => a.ArticleTags).ThenInclude(at => at.Tag)
            .Where(a => a.Id != current.Id
                && a.IsPublished
                && a.PublishedAt <= now
                && (a.NewsCategoryId == current.NewsCategoryId || a.ArticleTags.Any(at => tagIds.Contains(at.TagId))))
            .ToListAsync(cancellationToken);

        // Chấm điểm trong memory (tập dữ liệu 1 blog nội bộ nhỏ, không cần tối ưu SQL phức tạp): cùng
        // category = 2 điểm, mỗi tag trùng = 1 điểm - ưu tiên bài chung nhiều tag hơn bài chỉ chung category.
        return candidates
            .Select(a => new
            {
                Article = a,
                Score = (a.NewsCategoryId == current.NewsCategoryId ? 2 : 0) + a.ArticleTags.Count(at => tagIds.Contains(at.TagId))
            })
            .OrderByDescending(x => x.Score)
            .ThenByDescending(x => x.Article.PublishedAt)
            .Take(take)
            .Select(x => MapToListItemDto(x.Article))
            .ToList();
    }

    private static NewsArticleListItemDto MapToListItemDto(NewsArticle a) => new()
    {
        Id = a.Id,
        Title = a.Title,
        Slug = a.Slug,
        Summary = a.Summary,
        ThumbnailUrl = a.ThumbnailUrl,
        PublishedAt = a.PublishedAt,
        ViewCount = a.ViewCount,
        IsFeatured = a.IsFeatured,
        AuthorName = a.Author.FullName,
        WordCount = CountWords(a.Content),
        CategoryName = a.NewsCategory.Name,
        CategorySlug = a.NewsCategory.Slug,
        Tags = a.ArticleTags.Select(at => at.Tag.Name).ToList()
    };

    private static int CountWords(string content) =>
        content.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
}
