using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Content.Testimonials.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Content.Testimonials;

public interface IAdminTestimonialService
{
    Task<PagedResult<AdminTestimonialDto>> GetListAsync(TestimonialQueryParams query, CancellationToken cancellationToken = default);

    Task<AdminTestimonialDto> CreateAsync(CreateTestimonialDto dto, CancellationToken cancellationToken = default);

    Task<AdminTestimonialDto> UpdateAsync(int id, UpdateTestimonialDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
