using System.ComponentModel.DataAnnotations;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.Admin.Marketing.Promotions.Dtos;

public class PromotionScopeInputDto
{
    [Required, EnumDataType(typeof(ScopeType))]
    public ScopeType ScopeType { get; set; }

    public int? ServiceCategoryId { get; set; }

    public int? ServicePlanId { get; set; }
}
