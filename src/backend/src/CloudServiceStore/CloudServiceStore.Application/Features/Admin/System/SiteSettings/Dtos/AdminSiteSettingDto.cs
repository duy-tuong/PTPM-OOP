namespace CloudServiceStore.Application.Features.Admin.System.SiteSettings.Dtos;

public class AdminSiteSettingDto
{
    public int Id { get; init; }
    public string SettingKey { get; init; } = string.Empty;
    public string SettingValue { get; init; } = string.Empty;
    public string SettingGroup { get; init; } = string.Empty;
    public string DataType { get; init; } = "string";
    public DateTime? UpdatedAt { get; init; }
}
