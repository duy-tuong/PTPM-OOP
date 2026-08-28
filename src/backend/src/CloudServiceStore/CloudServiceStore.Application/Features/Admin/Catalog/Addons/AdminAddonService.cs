using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Catalog.Addons.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Sales;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Catalog.Addons;

public class AdminAddonService : IAdminAddonService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminAddonService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<AdminAddonDto>> GetListAsync(AddonQueryParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Addon, int>();

        var baseQuery = repository.Query()
            .Where(a => query.Search == null || a.Name.Contains(query.Search) || a.Sku.Contains(query.Search))
            .OrderBy(a => a.Name);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(MapToDto).ToList();
        return PagedResult<AdminAddonDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<AdminAddonDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Addon, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(Addon), id);
        }

        return MapToDto(entity);
    }

    public async Task<AdminAddonDto> CreateAsync(CreateAddonDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Addon, int>();

        await EnsureSkuIsUniqueAsync(repository, dto.Sku, excludeId: null, cancellationToken);

        var entity = new Addon
        {
            Name = dto.Name,
            Sku = dto.Sku,
            Type = dto.Type,
            BillingType = dto.BillingType,
            UnitName = dto.UnitName,
            PricePerMonth = dto.PricePerMonth,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<AdminAddonDto> UpdateAsync(int id, UpdateAddonDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Addon, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(Addon), id);
        }

        await EnsureSkuIsUniqueAsync(repository, dto.Sku, excludeId: id, cancellationToken);

        entity.Name = dto.Name;
        entity.Sku = dto.Sku;
        entity.Type = dto.Type;
        entity.BillingType = dto.BillingType;
        entity.UnitName = dto.UnitName;
        entity.PricePerMonth = dto.PricePerMonth;
        entity.IsActive = dto.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Addon, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(Addon), id);
        }

        // Không cho xoá cứng Addon đã từng thực mua (khách còn tra cứu lại đơn hàng cũ) - kiểm tra chủ
        // động ở đây thay vì để FK Restrict ném DbUpdateException khó đọc, xem
        // OrderRequestItemAddonConfiguration.cs.
        var isReferenced = await _unitOfWork.Repository<OrderRequestItemAddon, int>().Query()
            .AnyAsync(a => a.AddonId == id, cancellationToken);

        if (isReferenced)
        {
            throw new ConflictException("Addon đã được sử dụng trong đơn hàng, không thể xoá. Hãy tắt (IsActive=false) thay vì xoá.");
        }

        repository.Remove(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static async Task EnsureSkuIsUniqueAsync(
        IRepository<Addon, int> repository,
        string sku,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var isDuplicate = await repository.Query()
            .AnyAsync(a => a.Sku == sku && a.Id != (excludeId ?? 0), cancellationToken);

        if (isDuplicate)
        {
            throw new ConflictException($"Sku '{sku}' đã tồn tại.");
        }
    }

    private static AdminAddonDto MapToDto(Addon addon)
    {
        return new AdminAddonDto
        {
            Id = addon.Id,
            Name = addon.Name,
            Sku = addon.Sku,
            Type = addon.Type.ToString(),
            BillingType = addon.BillingType.ToString(),
            UnitName = addon.UnitName,
            PricePerMonth = addon.PricePerMonth,
            IsActive = addon.IsActive
        };
    }
}
