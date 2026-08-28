using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Catalog.OsImages.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Catalog.OsImages;

public class AdminOsImageService : IAdminOsImageService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminOsImageService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<AdminOsImageDto>> GetListAsync(OsImageQueryParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<OsImage, int>();

        var baseQuery = repository.Query()
            .Where(o => query.Search == null || o.Name.Contains(query.Search) || o.Slug.Contains(query.Search))
            .OrderBy(o => o.DisplayOrder).ThenBy(o => o.Name);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(MapToDto).ToList();
        return PagedResult<AdminOsImageDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<AdminOsImageDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<OsImage, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(OsImage), id);
        }

        return MapToDto(entity);
    }

    public async Task<AdminOsImageDto> CreateAsync(CreateOsImageDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<OsImage, int>();

        await EnsureSlugIsUniqueAsync(repository, dto.Slug, excludeId: null, cancellationToken);

        var entity = new OsImage
        {
            Name = dto.Name,
            Slug = dto.Slug,
            Family = dto.Family,
            // Chỉ Windows mới có phí bản quyền - bỏ qua giá trị Admin lỡ nhập khi chọn Linux, tránh dữ
            // liệu rác (khách chọn Linux nhưng vẫn hiện phí do dữ liệu cũ từ lần đổi Family qua lại).
            WindowsLicenseFeePerMonth = dto.Family == OsFamily.Windows ? dto.WindowsLicenseFeePerMonth : null,
            IsActive = dto.IsActive,
            DisplayOrder = dto.DisplayOrder,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<AdminOsImageDto> UpdateAsync(int id, UpdateOsImageDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<OsImage, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(OsImage), id);
        }

        await EnsureSlugIsUniqueAsync(repository, dto.Slug, excludeId: id, cancellationToken);

        entity.Name = dto.Name;
        entity.Slug = dto.Slug;
        entity.Family = dto.Family;
        entity.WindowsLicenseFeePerMonth = dto.Family == OsFamily.Windows ? dto.WindowsLicenseFeePerMonth : null;
        entity.IsActive = dto.IsActive;
        entity.DisplayOrder = dto.DisplayOrder;
        entity.UpdatedAt = DateTime.UtcNow;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<OsImage, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(OsImage), id);
        }

        // Không cho xoá cứng OsImage đã từng thực mua (khách còn tra cứu lại đơn hàng cũ) - kiểm tra
        // chủ động ở đây thay vì để FK Restrict ném DbUpdateException khó đọc, mirror
        // AdminAddonService.DeleteAsync.
        var isReferenced = await _unitOfWork.Repository<OrderRequestItem, int>().Query()
            .AnyAsync(i => i.OsImageId == id, cancellationToken);

        if (isReferenced)
        {
            throw new ConflictException("Hệ điều hành đã được sử dụng trong đơn hàng, không thể xoá. Hãy tắt (IsActive=false) thay vì xoá.");
        }

        repository.Remove(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static async Task EnsureSlugIsUniqueAsync(
        IRepository<OsImage, int> repository,
        string slug,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var isDuplicate = await repository.Query()
            .AnyAsync(o => o.Slug == slug && o.Id != (excludeId ?? 0), cancellationToken);

        if (isDuplicate)
        {
            throw new ConflictException($"Slug '{slug}' đã tồn tại.");
        }
    }

    private static AdminOsImageDto MapToDto(OsImage osImage)
    {
        return new AdminOsImageDto
        {
            Id = osImage.Id,
            Name = osImage.Name,
            Slug = osImage.Slug,
            Family = osImage.Family.ToString(),
            WindowsLicenseFeePerMonth = osImage.WindowsLicenseFeePerMonth,
            IsActive = osImage.IsActive,
            DisplayOrder = osImage.DisplayOrder
        };
    }
}
