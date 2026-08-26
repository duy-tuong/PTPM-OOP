using CloudServiceStore.Application.Features.Admin.Catalog.OsImages.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Catalog.OsImages;

public interface IAdminOsImageService
{
    Task<List<AdminOsImageDto>> GetListAsync(CancellationToken cancellationToken = default);

    Task<AdminOsImageDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<AdminOsImageDto> CreateAsync(CreateOsImageDto dto, CancellationToken cancellationToken = default);

    Task<AdminOsImageDto> UpdateAsync(int id, UpdateOsImageDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
