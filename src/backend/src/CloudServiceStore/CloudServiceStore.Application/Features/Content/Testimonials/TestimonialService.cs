using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Content.Testimonials.Dtos;
using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Content.Testimonials;

public class TestimonialService : ITestimonialService
{
    private readonly IUnitOfWork _unitOfWork;

    public TestimonialService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<TestimonialDto>> GetListAsync(CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Testimonial, int>();

        var entities = await repository.Query()
            .Where(t => t.IsActive)
            .OrderBy(t => t.DisplayOrder)
            .ToListAsync(cancellationToken);

        return entities.Select(t => new TestimonialDto
        {
            Id = t.Id,
            DisplayName = t.DisplayName,
            CompanyName = t.CompanyName,
            AvatarUrl = t.AvatarUrl,
            Content = t.Content,
            Rating = t.Rating,
            DisplayOrder = t.DisplayOrder
        }).ToList();
    }
}
