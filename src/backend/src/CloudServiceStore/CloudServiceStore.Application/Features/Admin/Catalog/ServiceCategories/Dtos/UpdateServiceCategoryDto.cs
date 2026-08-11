using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Admin.Catalog.ServiceCategories.Dtos;

public class UpdateServiceCategoryDto
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(120)]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? IconUrl { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; }
}
