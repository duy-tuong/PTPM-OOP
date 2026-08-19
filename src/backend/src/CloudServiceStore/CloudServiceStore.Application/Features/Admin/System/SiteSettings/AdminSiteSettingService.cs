using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Admin.System.SiteSettings.Dtos;
using CloudServiceStore.Domain.Entities.System;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.System.SiteSettings;

public class AdminSiteSettingService : IAdminSiteSettingService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISiteSettingsCache _siteSettingsCache;

    public AdminSiteSettingService(IUnitOfWork unitOfWork, ISiteSettingsCache siteSettingsCache)
    {
        _unitOfWork = unitOfWork;
        _siteSettingsCache = siteSettingsCache;
    }

    public async Task<List<AdminSiteSettingDto>> GetListAsync(CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<SiteSetting, int>();

        var entities = await repository.Query()
            .OrderBy(s => s.SettingGroup).ThenBy(s => s.SettingKey)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto).ToList();
    }

    public async Task<AdminSiteSettingDto> CreateAsync(CreateSiteSettingDto dto, Guid changedByUserId, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<SiteSetting, int>();

        await EnsureSettingKeyIsUniqueAsync(repository, dto.SettingKey, excludeId: null, cancellationToken);

        var entity = new SiteSetting
        {
            SettingKey = dto.SettingKey,
            SettingValue = dto.SettingValue,
            SettingGroup = dto.SettingGroup,
            DataType = dto.DataType,
            UpdatedByUserId = changedByUserId,
            UpdatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Singleton cache (Phase 2.3) - đây là nơi đầu tiên gọi RefreshAsync() ngoài lúc app khởi
        // động (Program.cs). Thiếu bước này thì Setting vừa lưu sẽ không có tác dụng cho tới khi
        // restart app.
        await _siteSettingsCache.RefreshAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<AdminSiteSettingDto> UpdateAsync(int id, UpdateSiteSettingDto dto, Guid changedByUserId, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<SiteSetting, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(SiteSetting), id);
        }

        await EnsureSettingKeyIsUniqueAsync(repository, dto.SettingKey, excludeId: id, cancellationToken);

        entity.SettingKey = dto.SettingKey;
        entity.SettingValue = dto.SettingValue;
        entity.SettingGroup = dto.SettingGroup;
        entity.DataType = dto.DataType;
        entity.UpdatedByUserId = changedByUserId;
        entity.UpdatedAt = DateTime.UtcNow;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _siteSettingsCache.RefreshAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<SiteSetting, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(SiteSetting), id);
        }

        repository.Remove(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _siteSettingsCache.RefreshAsync(cancellationToken);
    }

    private static async Task EnsureSettingKeyIsUniqueAsync(
        IRepository<SiteSetting, int> repository,
        string settingKey,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var isTaken = await repository.Query()
            .AnyAsync(s => s.SettingKey == settingKey && (excludeId == null || s.Id != excludeId), cancellationToken);
        if (isTaken)
        {
            throw new ConflictException($"Khoá cấu hình '{settingKey}' đã tồn tại.");
        }
    }

    private static AdminSiteSettingDto MapToDto(SiteSetting setting)
    {
        return new AdminSiteSettingDto
        {
            Id = setting.Id,
            SettingKey = setting.SettingKey,
            SettingValue = setting.SettingValue,
            SettingGroup = setting.SettingGroup,
            DataType = setting.DataType,
            UpdatedAt = setting.UpdatedAt
        };
    }
}
