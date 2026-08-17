using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Admin.Content.Testimonials.Dtos;
using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Content.Testimonials;

public class AdminTestimonialService : IAdminTestimonialService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminTestimonialService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<AdminTestimonialDto>> GetListAsync(CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Testimonial, int>();

        var entities = await repository.Query()
            .OrderBy(t => t.DisplayOrder)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto).ToList();
    }

    public async Task<AdminTestimonialDto> CreateAsync(CreateTestimonialDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Testimonial, int>();

        var entity = new Testimonial
        {
            DisplayName = dto.DisplayName,
            CompanyName = dto.CompanyName,
            AvatarUrl = dto.AvatarUrl,
            Content = dto.Content,
            Rating = dto.Rating,
            DisplayOrder = dto.DisplayOrder,
            IsActive = dto.IsActive,
            IsDeleted = false
        };

        await repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<AdminTestimonialDto> UpdateAsync(int id, UpdateTestimonialDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Testimonial, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(Testimonial), id);
        }

        entity.DisplayName = dto.DisplayName;
        entity.CompanyName = dto.CompanyName;
        entity.AvatarUrl = dto.AvatarUrl;
        entity.Content = dto.Content;
        entity.Rating = dto.Rating;
        entity.DisplayOrder = dto.DisplayOrder;
        entity.IsActive = dto.IsActive;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Testimonial, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(Testimonial), id);
        }

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static AdminTestimonialDto MapToDto(Testimonial entity)
    {
        return new AdminTestimonialDto
        {
            Id = entity.Id,
            DisplayName = entity.DisplayName,
            CompanyName = entity.CompanyName,
            AvatarUrl = entity.AvatarUrl,
            Content = entity.Content,
            Rating = entity.Rating,
            DisplayOrder = entity.DisplayOrder,
            IsActive = entity.IsActive
        };
    }
}
