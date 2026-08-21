using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Admin.Content.ContentPages.Dtos;

public class CreateContentPageDto
{
    [Required, MaxLength(150)]
    public string Slug { get; set; } = string.Empty;

    [Required, MaxLength(250)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? MetaTitle { get; set; }

    [MaxLength(500)]
    public string? MetaDescription { get; set; }

    public bool IsPublished { get; set; } = true;

    public int DisplayOrder { get; set; }
}
