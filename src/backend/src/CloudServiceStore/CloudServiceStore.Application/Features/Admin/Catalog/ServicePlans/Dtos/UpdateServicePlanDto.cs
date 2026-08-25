using System.ComponentModel.DataAnnotations;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.Admin.Catalog.ServicePlans.Dtos;

public class UpdateServicePlanDto
{
    [Required]
    public int CategoryId { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(120)]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(64)]
    public string? Sku { get; set; }

    [MaxLength(500)]
    public string? ShortDescription { get; set; }

    public string? Description { get; set; }

    public bool IsFeatured { get; set; }

    public ServicePlanStatus Status { get; set; }

    public bool AllowGrandfatheredRenewal { get; set; } = true;

    // Đổi gói (Phần 6) - có cho khách HẠ CẤP xuống gói này hay không. Xem ServicePlan.AllowDowngrade.
    public bool AllowDowngrade { get; set; } = true;

    [MaxLength(32)]
    public string? RegionId { get; set; }

    public ServicePlanPackageType PackageType { get; set; } = ServicePlanPackageType.Fixed;
    public int? MinVcpu { get; set; }
    public int? MaxVcpu { get; set; }
    public int? StepVcpu { get; set; }
    public int? MinRamMb { get; set; }
    public int? MaxRamMb { get; set; }
    public int? StepRamMb { get; set; }
    public int? MinDiskGb { get; set; }
    public int? MaxDiskGb { get; set; }
    public int? StepDiskGb { get; set; }
    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal? PricePerVcpuPerMonth { get; set; }
    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal? PricePerRamGbPerMonth { get; set; }
    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal? PricePerDiskGbPerMonth { get; set; }

    public int DisplayOrder { get; set; }

    public List<PlanFeatureInputDto> Features { get; set; } = new();

    public List<PlanPriceInputDto> Prices { get; set; } = new();

    public List<PlanAddonInputDto> Addons { get; set; } = new();
}
