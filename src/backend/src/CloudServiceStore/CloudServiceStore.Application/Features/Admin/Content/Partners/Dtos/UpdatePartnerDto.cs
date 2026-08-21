using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Admin.Content.Partners.Dtos;

public class UpdatePartnerDto
{
    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string LogoUrl { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? WebsiteUrl { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; }
}
