using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Content.NewsCategories.Dtos;
using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Content.NewsCategories;

public class AdminNewsCategoryService : IAdminNewsCategoryService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminNewsCategoryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<AdminNewsCategoryDto>> GetListAsync(NewsCategoryQueryParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<NewsCategory, int>();

        var baseQuery = repository.Query().OrderBy(c => c.DisplayOrder);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(MapToDto).ToList();
        return PagedResult<AdminNewsCategoryDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<AdminNewsCategoryDto> CreateAsync(CreateNewsCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<NewsCategory, int>();

        await EnsureSlugIsUniqueAsync(repository, dto.Slug, excludeId: null, cancellationToken);

        var entity = new NewsCategory
        {
            Name = dto.Name,
            Slug = dto.Slug,
            Description = dto.Description,
            DisplayOrder = dto.DisplayOrder,
            IsActive = dto.IsActive,
            IsDeleted = false
        };

        await repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<AdminNewsCategoryDto> UpdateAsync(int id, UpdateNewsCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<NewsCategory, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(NewsCategory), id);
        }

        await EnsureSlugIsUniqueAsync(repository, dto.Slug, excludeId: id, cancellationToken);

        entity.Name = dto.Name;
        entity.Slug = dto.Slug;
        entity.Description = dto.Description;
        entity.DisplayOrder = dto.DisplayOrder;
        entity.IsActive = dto.IsActive;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<NewsCategory, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(NewsCategory), id);
        }

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static async Task EnsureSlugIsUniqueAsync(
        IRepository<NewsCategory, int> repository,
        string slug,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var isDuplicate = await repository.Query()
            .AnyAsync(c => c.Slug == slug && c.Id != (excludeId ?? 0), cancellationToken);

        if (isDuplicate)
        {
            throw new ConflictException($"Slug '{slug}' đã tồn tại.");
        }
    }

    private static AdminNewsCategoryDto MapToDto(NewsCategory category)
    {
        return new AdminNewsCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive
        };
    }
}
