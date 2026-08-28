using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Content.Partners.Dtos;
using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Content.Partners;

public class AdminPartnerService : IAdminPartnerService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminPartnerService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<AdminPartnerDto>> GetListAsync(PartnerQueryParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Partner, int>();

        var baseQuery = repository.Query()
            .OrderBy(p => p.DisplayOrder);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(MapToDto).ToList();
        return PagedResult<AdminPartnerDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<AdminPartnerDto> CreateAsync(CreatePartnerDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Partner, int>();

        var entity = new Partner
        {
            Name = dto.Name,
            LogoUrl = dto.LogoUrl,
            WebsiteUrl = dto.WebsiteUrl,
            DisplayOrder = dto.DisplayOrder,
            IsActive = dto.IsActive,
            IsDeleted = false
        };

        await repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<AdminPartnerDto> UpdateAsync(int id, UpdatePartnerDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Partner, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(Partner), id);
        }

        entity.Name = dto.Name;
        entity.LogoUrl = dto.LogoUrl;
        entity.WebsiteUrl = dto.WebsiteUrl;
        entity.DisplayOrder = dto.DisplayOrder;
        entity.IsActive = dto.IsActive;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Partner, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(Partner), id);
        }

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static AdminPartnerDto MapToDto(Partner entity)
    {
        return new AdminPartnerDto
        {
            Id = entity.Id,
            Name = entity.Name,
            LogoUrl = entity.LogoUrl,
            WebsiteUrl = entity.WebsiteUrl,
            DisplayOrder = entity.DisplayOrder,
            IsActive = entity.IsActive
        };
    }
}
