namespace CloudServiceStore.Application.Features.Admin.Reporting.AuditLogs.Dtos;

public class AdminAuditLogDto
{
    public long Id { get; init; }
    public Guid? UserId { get; init; }
    public string? UserName { get; init; }
    public string Action { get; init; } = string.Empty;
    public string EntityName { get; init; } = string.Empty;
    public string EntityId { get; init; } = string.Empty;
    public string? OldValues { get; init; }
    public string? NewValues { get; init; }
    public DateTime Timestamp { get; init; }
}
