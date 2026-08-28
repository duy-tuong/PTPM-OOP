using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Application.Features.Admin.Content.NewsComments.Dtos;

public class NewsCommentQueryParams : PaginationParams
{
    public int? NewsArticleId { get; set; }
    public bool? IsApproved { get; set; }

    // Tìm theo nội dung bình luận, tên người gửi (khách vãng lai) hoặc họ tên khách hàng đã đăng nhập.
    public string? Search { get; set; }
}
