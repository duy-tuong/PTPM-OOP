using CloudServiceStore.Application.Features.Content.NewsTags.Dtos;

namespace CloudServiceStore.Application.Features.Content.NewsTags;

public interface INewsTagService
{
    // "Chủ đề phổ biến" (Đợt 6) - chỉ trả tag có ít nhất 1 bài viết published, sắp theo ArticleCount
    // giảm dần.
    Task<List<NewsTagDto>> GetListAsync(int take = 20, CancellationToken cancellationToken = default);
}
