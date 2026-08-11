using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Admin.Content.NewsArticles.Dtos;

public class CreateNewsArticleDto
{
    [Required]
    public int NewsCategoryId { get; set; }

    [Required, MaxLength(250)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(270)]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Summary { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ThumbnailUrl { get; set; }

    public bool IsPublished { get; set; } = true;

    public DateTime? PublishedAt { get; set; }

    public List<string> TagNames { get; set; } = new();
}
