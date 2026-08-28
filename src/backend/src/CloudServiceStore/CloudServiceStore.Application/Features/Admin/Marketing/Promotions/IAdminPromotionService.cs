using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Marketing.Promotions.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Marketing.Promotions;

public interface IAdminPromotionService
{
    Task<PagedResult<AdminPromotionDto>> GetListAsync(PromotionQueryParams query, CancellationToken cancellationToken = default);

    Task<AdminPromotionDto> CreateAsync(CreatePromotionDto dto, CancellationToken cancellationToken = default);

    Task<AdminPromotionDto> UpdateAsync(int id, UpdatePromotionDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
