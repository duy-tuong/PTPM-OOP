using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Content.Faqs.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Content.Faqs;

public interface IAdminFaqService
{
    Task<PagedResult<AdminFaqDto>> GetListAsync(FaqQueryParams query, CancellationToken cancellationToken = default);

    Task<AdminFaqDto> CreateAsync(CreateFaqDto dto, CancellationToken cancellationToken = default);

    Task<AdminFaqDto> UpdateAsync(int id, UpdateFaqDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
