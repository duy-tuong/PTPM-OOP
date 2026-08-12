using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Application.Features.Admin.Reporting.AuditLogs.Dtos;

public class AuditLogQueryParams : PaginationParams
{
    public string? EntityName { get; set; }
}
