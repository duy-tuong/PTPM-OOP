using System.ComponentModel.DataAnnotations;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.Admin.Catalog.OsImages.Dtos;

public class UpdateOsImageDto
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Slug { get; set; } = string.Empty;

    [Required]
    public OsFamily Family { get; set; }

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal? WindowsLicenseFeePerMonth { get; set; }

    public bool IsActive { get; set; }

    public int DisplayOrder { get; set; }
}
