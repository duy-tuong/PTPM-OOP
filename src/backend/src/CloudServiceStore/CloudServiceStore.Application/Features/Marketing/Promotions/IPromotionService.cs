using CloudServiceStore.Application.Features.Marketing.Promotions.Dtos;

namespace CloudServiceStore.Application.Features.Marketing.Promotions;

public interface IPromotionService
{
    Task<List<PromotionDto>> GetActiveListAsync(CancellationToken cancellationToken = default);
}
