using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Catalog.ServiceCategories.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Catalog.ServiceCategories;

public class ServiceCategoryService : IServiceCategoryService
{
    private readonly IUnitOfWork _unitOfWork;

    public ServiceCategoryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<ServiceCategoryDto>> GetListAsync(CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<ServiceCategory, int>();

        var entities = await repository.Query()
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto).ToList();
    }

    public async Task<ServiceCategoryDto> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<ServiceCategory, int>();

        var entity = await repository.Query()
            .FirstOrDefaultAsync(c => c.Slug == slug && c.IsActive, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(ServiceCategory), slug);
        }

        return MapToDto(entity);
    }

    private static ServiceCategoryDto MapToDto(ServiceCategory category)
    {
        return new ServiceCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            IconUrl = category.IconUrl,
            DisplayOrder = category.DisplayOrder
        };
    }
}
