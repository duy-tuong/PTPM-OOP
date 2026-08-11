using System.ComponentModel.DataAnnotations;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.Admin.Marketing.Promotions.Dtos;

public class UpdatePromotionDto
{
    [Required, MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Required, EnumDataType(typeof(DiscountType))]
    public DiscountType DiscountType { get; set; }

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal DiscountValue { get; set; }

    public decimal? MaxDiscountAmount { get; set; }

    public decimal? MinOrderValue { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    public int? UsageLimit { get; set; }

    public bool IsActive { get; set; }
}
