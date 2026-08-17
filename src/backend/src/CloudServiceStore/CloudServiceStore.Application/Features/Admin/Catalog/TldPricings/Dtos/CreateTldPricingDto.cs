using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Admin.Catalog.TldPricings.Dtos;

public class CreateTldPricingDto
{
    [Required, MaxLength(20)]
    public string Tld { get; set; } = string.Empty;

    public int? ServiceCategoryId { get; set; }

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal RegisterPrice { get; set; }

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal RenewPrice { get; set; }

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal TransferPrice { get; set; }

    [Required, MaxLength(3)]
    public string Currency { get; set; } = "VND";

    public bool IsActive { get; set; } = true;
}
