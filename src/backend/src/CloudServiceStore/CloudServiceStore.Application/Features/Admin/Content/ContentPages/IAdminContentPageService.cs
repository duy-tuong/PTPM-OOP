using CloudServiceStore.Application.Features.Admin.Content.ContentPages.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Content.ContentPages;

public interface IAdminContentPageService
{
    Task<List<AdminContentPageDto>> GetListAsync(CancellationToken cancellationToken = default);

    Task<AdminContentPageDto> CreateAsync(CreateContentPageDto dto, Guid authorId, CancellationToken cancellationToken = default);

    Task<AdminContentPageDto> UpdateAsync(int id, UpdateContentPageDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
