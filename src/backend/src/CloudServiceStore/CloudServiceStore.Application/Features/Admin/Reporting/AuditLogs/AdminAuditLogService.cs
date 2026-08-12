using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Reporting.AuditLogs.Dtos;
using CloudServiceStore.Domain.Entities.System;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Reporting.AuditLogs;

public class AdminAuditLogService : IAdminAuditLogService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminAuditLogService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<AdminAuditLogDto>> GetListAsync(AuditLogQueryParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<AuditLog, long>();

        var baseQuery = repository.Query()
            .Include(a => a.User)
            .Where(a => query.EntityName == null || a.EntityName == query.EntityName)
            .OrderByDescending(a => a.Timestamp);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(a => new AdminAuditLogDto
        {
            Id = a.Id,
            UserId = a.UserId,
            UserName = a.User?.FullName,
            Action = a.Action.ToString(),
            EntityName = a.EntityName,
            EntityId = a.EntityId,
            OldValues = a.OldValues,
            NewValues = a.NewValues,
            Timestamp = a.Timestamp
        }).ToList();

        return PagedResult<AdminAuditLogDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }
}
