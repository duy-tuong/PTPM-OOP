using CloudServiceStore.Application.Features.Admin.Content.NewsCategories.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Content.NewsCategories;

public interface IAdminNewsCategoryService
{
    Task<List<AdminNewsCategoryDto>> GetListAsync(CancellationToken cancellationToken = default);

    Task<AdminNewsCategoryDto> CreateAsync(CreateNewsCategoryDto dto, CancellationToken cancellationToken = default);

    Task<AdminNewsCategoryDto> UpdateAsync(int id, UpdateNewsCategoryDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
