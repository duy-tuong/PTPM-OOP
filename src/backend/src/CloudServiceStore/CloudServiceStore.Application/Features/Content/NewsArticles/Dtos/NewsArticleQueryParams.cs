using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Application.Features.Content.NewsArticles.Dtos;

public class NewsArticleQueryParams : PaginationParams
{
    public string? CategorySlug { get; set; }
    public string? TagSlug { get; set; }
    public string? Search { get; set; }
}
