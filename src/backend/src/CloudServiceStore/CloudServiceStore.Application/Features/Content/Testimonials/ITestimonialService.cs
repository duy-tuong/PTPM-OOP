using CloudServiceStore.Application.Features.Content.Testimonials.Dtos;

namespace CloudServiceStore.Application.Features.Content.Testimonials;

public interface ITestimonialService
{
    Task<List<TestimonialDto>> GetListAsync(CancellationToken cancellationToken = default);
}
