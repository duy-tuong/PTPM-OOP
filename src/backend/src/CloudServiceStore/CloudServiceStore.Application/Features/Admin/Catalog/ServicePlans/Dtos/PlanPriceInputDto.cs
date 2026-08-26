using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Admin.Catalog.ServicePlans.Dtos;

public class PlanPriceInputDto
{
    [Range(1, 60)]
    public int PeriodMonths { get; set; }

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal Price { get; set; }

    public decimal? PromotionalPrice { get; set; }

    [Required, MaxLength(3)]
    public string Currency { get; set; } = "VND";

    public bool IsDefault { get; set; }

    public bool IsActive { get; set; } = true;

    // Chỉ có ý nghĩa khi ServicePlan.PackageType = Custom (bỏ qua Price ở trên) - % giảm giá theo chu
    // kỳ so với giá tháng cơ sở, xem PlanPrice.cs.
    [Range(typeof(decimal), "0", "100")]
    public decimal? DiscountPercent { get; set; }
}
