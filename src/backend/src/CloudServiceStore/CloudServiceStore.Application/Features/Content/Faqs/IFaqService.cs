using CloudServiceStore.Application.Features.Content.Faqs.Dtos;

namespace CloudServiceStore.Application.Features.Content.Faqs;

public interface IFaqService
{
    Task<List<FaqDto>> GetListAsync(int? serviceCategoryId, CancellationToken cancellationToken = default);
}
