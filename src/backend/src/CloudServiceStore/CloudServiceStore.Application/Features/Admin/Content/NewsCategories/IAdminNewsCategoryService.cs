using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Content.NewsCategories.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Content.NewsCategories;

public interface IAdminNewsCategoryService
{
    Task<PagedResult<AdminNewsCategoryDto>> GetListAsync(NewsCategoryQueryParams query, CancellationToken cancellationToken = default);

    Task<AdminNewsCategoryDto> CreateAsync(CreateNewsCategoryDto dto, CancellationToken cancellationToken = default);

    Task<AdminNewsCategoryDto> UpdateAsync(int id, UpdateNewsCategoryDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
