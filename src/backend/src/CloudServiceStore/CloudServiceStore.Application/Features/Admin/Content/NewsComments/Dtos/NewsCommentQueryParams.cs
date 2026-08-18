using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Application.Features.Admin.Content.NewsComments.Dtos;

public class NewsCommentQueryParams : PaginationParams
{
    public int? NewsArticleId { get; set; }
    public bool? IsApproved { get; set; }
}
