using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Admin.Sales.AffiliateApplications.Dtos;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Entities.System;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Sales.AffiliateApplications;

public class AdminAffiliateApplicationService : IAdminAffiliateApplicationService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminAffiliateApplicationService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<AdminAffiliateApplicationDto>> GetListAsync(CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<AffiliateApplication, int>();

        var entities = await repository.Query()
            .Include(a => a.ReviewedByUser)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto).ToList();
    }

    public async Task<AdminAffiliateApplicationDto> UpdateStatusAsync(int id, UpdateAffiliateApplicationStatusDto dto, Guid changedByUserId, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<AffiliateApplication, int>();

        var entity = await repository.Query()
            .Include(a => a.ReviewedByUser)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(AffiliateApplication), id);
        }

        var oldStatus = entity.Status;
        entity.Status = dto.NewStatus;
        entity.ReviewedByUserId = changedByUserId;
        entity.ReviewedAt = DateTime.UtcNow;
        entity.ReviewNote = dto.ReviewNote;

        repository.Update(entity);

        // Không dùng OrderStatusNotifier (chỉ dành riêng cho OrderRequestStatus) — ghi AuditLog
        // trực tiếp, vẫn gộp chung 1 SaveChanges với việc cập nhật Status ở trên.
        var auditLog = new AuditLog
        {
            UserId = changedByUserId,
            Action = AuditAction.StatusChange,
            EntityName = nameof(AffiliateApplication),
            EntityId = id.ToString(),
            OldValues = oldStatus.ToString(),
            NewValues = dto.NewStatus.ToString(),
            Timestamp = DateTime.UtcNow
        };
        await _unitOfWork.Repository<AuditLog, long>().AddAsync(auditLog, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    private static AdminAffiliateApplicationDto MapToDto(AffiliateApplication application)
    {
        return new AdminAffiliateApplicationDto
        {
            Id = application.Id,
            FullName = application.FullName,
            Email = application.Email,
            Phone = application.Phone,
            WebsiteUrl = application.WebsiteUrl,
            PromotionPlan = application.PromotionPlan,
            Status = application.Status.ToString(),
            ReviewedByUserName = application.ReviewedByUser?.FullName,
            ReviewedAt = application.ReviewedAt,
            ReviewNote = application.ReviewNote,
            CreatedAt = application.CreatedAt
        };
    }
}
