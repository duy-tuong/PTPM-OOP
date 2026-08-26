using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Content.NewsArticles.Dtos;

namespace CloudServiceStore.Application.Features.Content.NewsArticles;

public interface INewsArticleService
{
    Task<PagedResult<NewsArticleListItemDto>> GetListAsync(NewsArticleQueryParams query, CancellationToken cancellationToken = default);

    Task<NewsArticleDetailDto> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);

    // Tách khỏi GetBySlugAsync (trước đây tăng ViewCount vô điều kiện mỗi lần gọi, không dedup) - dedup
    // thật sự xảy ra ở tầng Route Handler Next.js (cookie httpOnly), method này chỉ đơn thuần +1. No-op
    // (không throw) nếu slug không khớp bài đang published - đây là tracking phụ, không được làm hỏng
    // trải nghiệm đọc bài.
    Task IncrementViewCountAsync(string slug, CancellationToken cancellationToken = default);

    // Bài viết liên quan theo category + tag trùng (chấm điểm, xem NewsArticleService) - thay cho cách
    // frontend tự filter theo category cũ (không phân biệt được số tag trùng).
    Task<List<NewsArticleListItemDto>> GetRelatedAsync(string slug, int take = 3, CancellationToken cancellationToken = default);
}
