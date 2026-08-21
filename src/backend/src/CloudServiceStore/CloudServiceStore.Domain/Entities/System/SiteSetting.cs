using CloudServiceStore.Domain.Entities.Identity;

namespace CloudServiceStore.Domain.Entities.System;

public class SiteSetting
{
    public int Id { get; set; }
    public string SettingKey { get; set; } = string.Empty;
    public string SettingValue { get; set; } = string.Empty;
    public string SettingGroup { get; set; } = string.Empty;
    public string DataType { get; set; } = "string";
    public DateTime? UpdatedAt { get; set; }

    public Guid? UpdatedByUserId { get; set; }
    public AppUser? UpdatedByUser { get; set; }
}
