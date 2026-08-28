using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Catalog.TldPricings.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Catalog.TldPricings;

public class AdminTldPricingService : IAdminTldPricingService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminTldPricingService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<AdminTldPricingDto>> GetListAsync(TldPricingQueryParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<TldPricing, int>();

        var baseQuery = repository.Query()
            .Where(t => query.Search == null || t.Tld.Contains(query.Search))
            .OrderBy(t => t.Tld);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(MapToDto).ToList();
        return PagedResult<AdminTldPricingDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<AdminTldPricingDto> CreateAsync(CreateTldPricingDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<TldPricing, int>();

        await EnsureTldIsUniqueAsync(repository, dto.Tld, excludeId: null, cancellationToken);

        var entity = new TldPricing
        {
            Tld = dto.Tld,
            ServiceCategoryId = dto.ServiceCategoryId,
            RegisterPrice = dto.RegisterPrice,
            RenewPrice = dto.RenewPrice,
            TransferPrice = dto.TransferPrice,
            Currency = dto.Currency,
            IsActive = dto.IsActive,
            IsDeleted = false
        };

        await repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<AdminTldPricingDto> UpdateAsync(int id, UpdateTldPricingDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<TldPricing, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(TldPricing), id);
        }

        await EnsureTldIsUniqueAsync(repository, dto.Tld, excludeId: id, cancellationToken);

        entity.Tld = dto.Tld;
        entity.ServiceCategoryId = dto.ServiceCategoryId;
        entity.RegisterPrice = dto.RegisterPrice;
        entity.RenewPrice = dto.RenewPrice;
        entity.TransferPrice = dto.TransferPrice;
        entity.Currency = dto.Currency;
        entity.IsActive = dto.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<TldPricing, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(TldPricing), id);
        }

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static async Task EnsureTldIsUniqueAsync(
        IRepository<TldPricing, int> repository,
        string tld,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var isDuplicate = await repository.Query()
            .AnyAsync(t => t.Tld == tld && t.Id != (excludeId ?? 0), cancellationToken);

        if (isDuplicate)
        {
            throw new ConflictException($"Tên miền '{tld}' đã tồn tại.");
        }
    }

    private static AdminTldPricingDto MapToDto(TldPricing entity)
    {
        return new AdminTldPricingDto
        {
            Id = entity.Id,
            Tld = entity.Tld,
            ServiceCategoryId = entity.ServiceCategoryId,
            RegisterPrice = entity.RegisterPrice,
            RenewPrice = entity.RenewPrice,
            TransferPrice = entity.TransferPrice,
            Currency = entity.Currency,
            IsActive = entity.IsActive
        };
    }
}
