using CloudServiceStore.Application.Features.Content.Partners.Dtos;

namespace CloudServiceStore.Application.Features.Content.Partners;

public interface IPartnerService
{
    Task<List<PartnerDto>> GetListAsync(CancellationToken cancellationToken = default);
}
