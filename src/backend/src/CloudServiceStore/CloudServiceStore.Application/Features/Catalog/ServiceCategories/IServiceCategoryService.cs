using CloudServiceStore.Application.Features.Catalog.ServiceCategories.Dtos;

namespace CloudServiceStore.Application.Features.Catalog.ServiceCategories;

public interface IServiceCategoryService
{
    Task<List<ServiceCategoryDto>> GetListAsync(CancellationToken cancellationToken = default);

    Task<ServiceCategoryDto> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
}
