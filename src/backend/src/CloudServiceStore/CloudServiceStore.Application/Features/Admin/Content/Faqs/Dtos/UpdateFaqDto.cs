using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Admin.Content.Faqs.Dtos;

public class UpdateFaqDto
{
    [Required, MaxLength(500)]
    public string Question { get; set; } = string.Empty;

    [Required, MaxLength(2000)]
    public string Answer { get; set; } = string.Empty;

    public int? ServiceCategoryId { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; }
}
