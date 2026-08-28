using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Content.Faqs.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Content.Faqs;

public class AdminFaqService : IAdminFaqService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminFaqService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<AdminFaqDto>> GetListAsync(FaqQueryParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Faq, int>();

        var baseQuery = repository.Query()
            .OrderBy(f => f.DisplayOrder);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(MapToDto).ToList();
        return PagedResult<AdminFaqDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<AdminFaqDto> CreateAsync(CreateFaqDto dto, CancellationToken cancellationToken = default)
    {
        await EnsureServiceCategoryExistsAsync(dto.ServiceCategoryId, cancellationToken);

        var entity = new Faq
        {
            Question = dto.Question,
            Answer = dto.Answer,
            ServiceCategoryId = dto.ServiceCategoryId,
            DisplayOrder = dto.DisplayOrder,
            IsActive = dto.IsActive,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow
        };

        var repository = _unitOfWork.Repository<Faq, int>();
        await repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<AdminFaqDto> UpdateAsync(int id, UpdateFaqDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Faq, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(Faq), id);
        }

        await EnsureServiceCategoryExistsAsync(dto.ServiceCategoryId, cancellationToken);

        entity.Question = dto.Question;
        entity.Answer = dto.Answer;
        entity.ServiceCategoryId = dto.ServiceCategoryId;
        entity.DisplayOrder = dto.DisplayOrder;
        entity.IsActive = dto.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Faq, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(Faq), id);
        }

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureServiceCategoryExistsAsync(int? serviceCategoryId, CancellationToken cancellationToken)
    {
        if (serviceCategoryId is null)
        {
            return;
        }

        var categoryRepository = _unitOfWork.Repository<ServiceCategory, int>();
        var category = await categoryRepository.GetByIdAsync(serviceCategoryId.Value, cancellationToken);
        if (category is null)
        {
            throw new NotFoundException(nameof(ServiceCategory), serviceCategoryId.Value);
        }
    }

    private static AdminFaqDto MapToDto(Faq faq)
    {
        return new AdminFaqDto
        {
            Id = faq.Id,
            Question = faq.Question,
            Answer = faq.Answer,
            ServiceCategoryId = faq.ServiceCategoryId,
            DisplayOrder = faq.DisplayOrder,
            IsActive = faq.IsActive
        };
    }
}
