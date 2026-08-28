using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Catalog.ServiceCategories.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Catalog.ServiceCategories;

public interface IAdminServiceCategoryService
{
    Task<PagedResult<AdminServiceCategoryDto>> GetListAsync(ServiceCategoryQueryParams query, CancellationToken cancellationToken = default);

    Task<AdminServiceCategoryDto> CreateAsync(CreateServiceCategoryDto dto, CancellationToken cancellationToken = default);

    Task<AdminServiceCategoryDto> UpdateAsync(int id, UpdateServiceCategoryDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
