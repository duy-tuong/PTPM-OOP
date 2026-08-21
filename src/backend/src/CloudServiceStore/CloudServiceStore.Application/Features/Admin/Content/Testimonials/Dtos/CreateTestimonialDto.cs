using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Admin.Content.Testimonials.Dtos;

public class CreateTestimonialDto
{
    [Required, MaxLength(100)]
    public string DisplayName { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? CompanyName { get; set; }

    [MaxLength(500)]
    public string? AvatarUrl { get; set; }

    [Required, MaxLength(1000)]
    public string Content { get; set; } = string.Empty;

    [Range(1, 5)]
    public int? Rating { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; } = true;
}
