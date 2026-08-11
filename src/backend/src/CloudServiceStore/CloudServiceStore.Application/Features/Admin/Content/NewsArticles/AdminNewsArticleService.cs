using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Utils;
using CloudServiceStore.Application.Features.Admin.Content.NewsArticles.Dtos;
using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Content.NewsArticles;

public class AdminNewsArticleService : IAdminNewsArticleService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminNewsArticleService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<AdminNewsArticleDto> CreateAsync(CreateNewsArticleDto dto, Guid authorId, CancellationToken cancellationToken = default)
    {
        var articleRepository = _unitOfWork.Repository<NewsArticle, int>();

        await EnsureCategoryExistsAsync(dto.NewsCategoryId, cancellationToken);
        await EnsureSlugIsUniqueAsync(articleRepository, dto.Slug, excludeId: null, cancellationToken);

        var articleTags = await ResolveTagsAsync(dto.TagNames, cancellationToken);

        var entity = new NewsArticle
        {
            AuthorId = authorId,
            NewsCategoryId = dto.NewsCategoryId,
            Title = dto.Title,
            Slug = dto.Slug,
            Summary = dto.Summary,
            Content = dto.Content,
            ThumbnailUrl = dto.ThumbnailUrl,
            ViewCount = 0,
            IsPublished = dto.IsPublished,
            PublishedAt = dto.PublishedAt ?? DateTime.UtcNow,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
            ArticleTags = articleTags
        };

        await articleRepository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<AdminNewsArticleDto> UpdateAsync(int id, UpdateNewsArticleDto dto, CancellationToken cancellationToken = default)
    {
        var articleRepository = _unitOfWork.Repository<NewsArticle, int>();

        var entity = await articleRepository.Query()
            .Include(a => a.ArticleTags).ThenInclude(at => at.Tag)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(NewsArticle), id);
        }

        await EnsureCategoryExistsAsync(dto.NewsCategoryId, cancellationToken);
        await EnsureSlugIsUniqueAsync(articleRepository, dto.Slug, excludeId: id, cancellationToken);

        entity.NewsCategoryId = dto.NewsCategoryId;
        entity.Title = dto.Title;
        entity.Slug = dto.Slug;
        entity.Summary = dto.Summary;
        entity.Content = dto.Content;
        entity.ThumbnailUrl = dto.ThumbnailUrl;
        entity.IsPublished = dto.IsPublished;
        entity.PublishedAt = dto.PublishedAt ?? entity.PublishedAt;
        entity.UpdatedAt = DateTime.UtcNow;

        var newTags = await ResolveTagsAsync(dto.TagNames, cancellationToken);
        entity.ArticleTags.Clear();
        foreach (var tag in newTags)
        {
            entity.ArticleTags.Add(tag);
        }

        articleRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var articleRepository = _unitOfWork.Repository<NewsArticle, int>();

        var entity = await articleRepository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(NewsArticle), id);
        }

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;

        articleRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    // Nhận danh sách tên tag từ Admin, tự tìm NewsTag đã có (theo slug) để tái sử dụng,
    // tag nào chưa có thì tạo mới — tránh Admin phải quản lý riêng 1 màn hình CRUD Tag.
    private async Task<List<NewsArticleTag>> ResolveTagsAsync(List<string> tagNames, CancellationToken cancellationToken)
    {
        var tagRepository = _unitOfWork.Repository<NewsTag, int>();
        var result = new List<NewsArticleTag>();

        var distinctNames = tagNames
            .Select(t => t.Trim())
            .Where(t => t.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase);

        foreach (var name in distinctNames)
        {
            var slug = SlugGenerator.Generate(name);
            var existingTag = await tagRepository.Query().FirstOrDefaultAsync(t => t.Slug == slug, cancellationToken);

            result.Add(new NewsArticleTag
            {
                Tag = existingTag ?? new NewsTag { Name = name, Slug = slug }
            });
        }

        return result;
    }

    private async Task EnsureCategoryExistsAsync(int categoryId, CancellationToken cancellationToken)
    {
        var categoryRepository = _unitOfWork.Repository<NewsCategory, int>();
        var category = await categoryRepository.GetByIdAsync(categoryId, cancellationToken);
        if (category is null)
        {
            throw new NotFoundException(nameof(NewsCategory), categoryId);
        }
    }

    private static async Task EnsureSlugIsUniqueAsync(
        IRepository<NewsArticle, int> repository,
        string slug,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var isDuplicate = await repository.Query()
            .AnyAsync(a => a.Slug == slug && a.Id != (excludeId ?? 0), cancellationToken);

        if (isDuplicate)
        {
            throw new ConflictException($"Slug '{slug}' đã tồn tại.");
        }
    }

    private static AdminNewsArticleDto MapToDto(NewsArticle article)
    {
        return new AdminNewsArticleDto
        {
            Id = article.Id,
            NewsCategoryId = article.NewsCategoryId,
            Title = article.Title,
            Slug = article.Slug,
            Summary = article.Summary,
            Content = article.Content,
            ThumbnailUrl = article.ThumbnailUrl,
            IsPublished = article.IsPublished,
            PublishedAt = article.PublishedAt,
            ViewCount = article.ViewCount,
            AuthorId = article.AuthorId,
            Tags = article.ArticleTags.Select(at => at.Tag.Name).ToList()
        };
    }
}
