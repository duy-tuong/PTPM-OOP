using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Admin.Catalog.ServiceCategories.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Catalog.ServiceCategories;

public class AdminServiceCategoryService : IAdminServiceCategoryService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminServiceCategoryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<AdminServiceCategoryDto>> GetListAsync(CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<ServiceCategory, int>();

        var entities = await repository.Query()
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto).ToList();
    }

    public async Task<AdminServiceCategoryDto> CreateAsync(CreateServiceCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<ServiceCategory, int>();

        await EnsureSlugIsUniqueAsync(repository, dto.Slug, excludeId: null, cancellationToken);

        var entity = new ServiceCategory
        {
            Name = dto.Name,
            Slug = dto.Slug,
            Description = dto.Description,
            IconUrl = dto.IconUrl,
            DisplayOrder = dto.DisplayOrder,
            IsActive = dto.IsActive,
            IsDeleted = false
        };

        await repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<AdminServiceCategoryDto> UpdateAsync(int id, UpdateServiceCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<ServiceCategory, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(ServiceCategory), id);
        }

        await EnsureSlugIsUniqueAsync(repository, dto.Slug, excludeId: id, cancellationToken);

        entity.Name = dto.Name;
        entity.Slug = dto.Slug;
        entity.Description = dto.Description;
        entity.IconUrl = dto.IconUrl;
        entity.DisplayOrder = dto.DisplayOrder;
        entity.IsActive = dto.IsActive;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<ServiceCategory, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(ServiceCategory), id);
        }

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static async Task EnsureSlugIsUniqueAsync(
        IRepository<ServiceCategory, int> repository,
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

    private static AdminServiceCategoryDto MapToDto(ServiceCategory category)
    {
        return new AdminServiceCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            IconUrl = category.IconUrl,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive
        };
    }
}
