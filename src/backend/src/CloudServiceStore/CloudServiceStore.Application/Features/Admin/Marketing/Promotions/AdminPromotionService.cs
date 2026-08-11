using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Admin.Marketing.Promotions.Dtos;
using CloudServiceStore.Domain.Entities.Marketing;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Marketing.Promotions;

public class AdminPromotionService : IAdminPromotionService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminPromotionService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<AdminPromotionDto>> GetListAsync(CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Promotion, int>();

        var entities = await repository.Query()
            .OrderByDescending(p => p.StartDate)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto).ToList();
    }

    public async Task<AdminPromotionDto> CreateAsync(CreatePromotionDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Promotion, int>();

        await EnsureCodeIsUniqueAsync(repository, dto.Code, excludeId: null, cancellationToken);

        var entity = new Promotion
        {
            Code = dto.Code,
            Name = dto.Name,
            Description = dto.Description,
            DiscountType = dto.DiscountType,
            DiscountValue = dto.DiscountValue,
            MaxDiscountAmount = dto.MaxDiscountAmount,
            MinOrderValue = dto.MinOrderValue,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            UsageLimit = dto.UsageLimit,
            UsageCount = 0,
            IsActive = dto.IsActive,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<AdminPromotionDto> UpdateAsync(int id, UpdatePromotionDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Promotion, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(Promotion), id);
        }

        await EnsureCodeIsUniqueAsync(repository, dto.Code, excludeId: id, cancellationToken);

        entity.Code = dto.Code;
        entity.Name = dto.Name;
        entity.Description = dto.Description;
        entity.DiscountType = dto.DiscountType;
        entity.DiscountValue = dto.DiscountValue;
        entity.MaxDiscountAmount = dto.MaxDiscountAmount;
        entity.MinOrderValue = dto.MinOrderValue;
        entity.StartDate = dto.StartDate;
        entity.EndDate = dto.EndDate;
        entity.UsageLimit = dto.UsageLimit;
        entity.IsActive = dto.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Promotion, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(Promotion), id);
        }

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static async Task EnsureCodeIsUniqueAsync(
        IRepository<Promotion, int> repository,
        string code,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var isDuplicate = await repository.Query()
            .AnyAsync(p => p.Code == code && p.Id != (excludeId ?? 0), cancellationToken);

        if (isDuplicate)
        {
            throw new ConflictException($"Mã khuyến mãi '{code}' đã tồn tại.");
        }
    }

    private static AdminPromotionDto MapToDto(Promotion promotion)
    {
        return new AdminPromotionDto
        {
            Id = promotion.Id,
            Code = promotion.Code,
            Name = promotion.Name,
            Description = promotion.Description,
            DiscountType = promotion.DiscountType.ToString(),
            DiscountValue = promotion.DiscountValue,
            MaxDiscountAmount = promotion.MaxDiscountAmount,
            MinOrderValue = promotion.MinOrderValue,
            StartDate = promotion.StartDate,
            EndDate = promotion.EndDate,
            UsageLimit = promotion.UsageLimit,
            UsageCount = promotion.UsageCount,
            IsActive = promotion.IsActive
        };
    }
}
