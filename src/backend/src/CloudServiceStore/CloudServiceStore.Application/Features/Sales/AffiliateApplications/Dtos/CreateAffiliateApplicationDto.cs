using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Sales.AffiliateApplications.Dtos;

public class CreateAffiliateApplicationDto
{
    [Required, MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? WebsiteUrl { get; set; }

    [MaxLength(500)]
    public string? PromotionPlan { get; set; }
}
