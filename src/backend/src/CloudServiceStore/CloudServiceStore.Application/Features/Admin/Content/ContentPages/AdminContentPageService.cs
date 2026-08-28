using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Content.ContentPages.Dtos;
using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Content.ContentPages;

public class AdminContentPageService : IAdminContentPageService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminContentPageService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<AdminContentPageDto>> GetListAsync(ContentPageQueryParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<ContentPage, int>();

        var baseQuery = repository.Query()
            .Where(p => query.Search == null || p.Title.Contains(query.Search) || p.Slug.Contains(query.Search))
            .OrderBy(p => p.DisplayOrder);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(MapToDto).ToList();
        return PagedResult<AdminContentPageDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<AdminContentPageDto> CreateAsync(CreateContentPageDto dto, Guid authorId, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<ContentPage, int>();

        await EnsureSlugIsUniqueAsync(repository, dto.Slug, excludeId: null, cancellationToken);

        var entity = new ContentPage
        {
            Slug = dto.Slug,
            Title = dto.Title,
            Content = dto.Content,
            MetaTitle = dto.MetaTitle,
            MetaDescription = dto.MetaDescription,
            AuthorId = authorId,
            IsPublished = dto.IsPublished,
            PublishedAt = dto.IsPublished ? DateTime.UtcNow : null,
            DisplayOrder = dto.DisplayOrder,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<AdminContentPageDto> UpdateAsync(int id, UpdateContentPageDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<ContentPage, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(ContentPage), id);
        }

        await EnsureSlugIsUniqueAsync(repository, dto.Slug, excludeId: id, cancellationToken);

        entity.Slug = dto.Slug;
        entity.Title = dto.Title;
        entity.Content = dto.Content;
        entity.MetaTitle = dto.MetaTitle;
        entity.MetaDescription = dto.MetaDescription;
        if (dto.IsPublished && !entity.IsPublished)
        {
            entity.PublishedAt = DateTime.UtcNow;
        }
        entity.IsPublished = dto.IsPublished;
        entity.DisplayOrder = dto.DisplayOrder;
        entity.UpdatedAt = DateTime.UtcNow;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<ContentPage, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(ContentPage), id);
        }

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static async Task EnsureSlugIsUniqueAsync(
        IRepository<ContentPage, int> repository,
        string slug,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var isDuplicate = await repository.Query()
            .AnyAsync(p => p.Slug == slug && p.Id != (excludeId ?? 0), cancellationToken);

        if (isDuplicate)
        {
            throw new ConflictException($"Slug '{slug}' đã tồn tại.");
        }
    }

    private static AdminContentPageDto MapToDto(ContentPage page)
    {
        return new AdminContentPageDto
        {
            Id = page.Id,
            Slug = page.Slug,
            Title = page.Title,
            Content = page.Content,
            MetaTitle = page.MetaTitle,
            MetaDescription = page.MetaDescription,
            AuthorId = page.AuthorId,
            IsPublished = page.IsPublished,
            PublishedAt = page.PublishedAt,
            DisplayOrder = page.DisplayOrder
        };
    }
}
