using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Admin.System.SiteSettings.Dtos;

public class CreateSiteSettingDto
{
    [Required, MaxLength(100)]
    public string SettingKey { get; set; } = string.Empty;

    [Required, MaxLength(2000)]
    public string SettingValue { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string SettingGroup { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string DataType { get; set; } = "string";
}
