namespace CloudServiceStore.Application.Features.Admin.Content.Testimonials.Dtos;

public class AdminTestimonialDto
{
    public int Id { get; init; }
    public string DisplayName { get; init; } = string.Empty;
    public string? CompanyName { get; init; }
    public string? AvatarUrl { get; init; }
    public string Content { get; init; } = string.Empty;
    public int? Rating { get; init; }
    public int DisplayOrder { get; init; }
    public bool IsActive { get; init; }
}
