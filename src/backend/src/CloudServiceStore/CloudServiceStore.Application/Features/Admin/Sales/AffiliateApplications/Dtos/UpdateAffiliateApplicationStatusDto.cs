using System.ComponentModel.DataAnnotations;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.Admin.Sales.AffiliateApplications.Dtos;

public class UpdateAffiliateApplicationStatusDto
{
    [Required, EnumDataType(typeof(AffiliateApplicationStatus))]
    public AffiliateApplicationStatus NewStatus { get; set; }

    [MaxLength(1000)]
    public string? ReviewNote { get; set; }
}
