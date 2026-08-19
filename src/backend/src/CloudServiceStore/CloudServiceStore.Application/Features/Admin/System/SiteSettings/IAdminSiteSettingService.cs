using CloudServiceStore.Application.Features.Admin.System.SiteSettings.Dtos;

namespace CloudServiceStore.Application.Features.Admin.System.SiteSettings;

public interface IAdminSiteSettingService
{
    Task<List<AdminSiteSettingDto>> GetListAsync(CancellationToken cancellationToken = default);

    Task<AdminSiteSettingDto> CreateAsync(CreateSiteSettingDto dto, Guid changedByUserId, CancellationToken cancellationToken = default);

    Task<AdminSiteSettingDto> UpdateAsync(int id, UpdateSiteSettingDto dto, Guid changedByUserId, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
