using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Application.Features.Content.NewsArticles.Dtos;

public class NewsArticleQueryParams : PaginationParams
{
    public string? CategorySlug { get; set; }
    public string? TagSlug { get; set; }
    public string? Search { get; set; }
    public bool? Featured { get; set; }
    // "latest" (mặc định) | "oldest" | "popular" - xem NewsArticleService.GetListAsync.
    public string? Sort { get; set; }
}
