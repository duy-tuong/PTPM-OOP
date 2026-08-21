using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Reporting.AuditLogs.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Reporting.AuditLogs;

public interface IAdminAuditLogService
{
    Task<PagedResult<AdminAuditLogDto>> GetListAsync(AuditLogQueryParams query, CancellationToken cancellationToken = default);
}
