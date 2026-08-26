using System.ComponentModel.DataAnnotations;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.Admin.Catalog.Addons.Dtos;

public class UpdateAddonDto
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(64)]
    public string Sku { get; set; } = string.Empty;

    [Required]
    public AddonType Type { get; set; }

    [Required]
    public AddonBillingType BillingType { get; set; }

    [MaxLength(20)]
    public string? UnitName { get; set; }

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal PricePerMonth { get; set; }

    public bool IsActive { get; set; }
}
