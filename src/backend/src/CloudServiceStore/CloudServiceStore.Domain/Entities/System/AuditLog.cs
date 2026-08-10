using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities.System;

public class AuditLog
{
    public long Id { get; set; }

    public Guid? UserId { get; set; }
    public AppUser? User { get; set; }

    public AuditAction Action { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? IpAddress { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
