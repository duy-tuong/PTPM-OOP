using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Application.Features.Admin.Content.Testimonials.Dtos;

public class TestimonialQueryParams : PaginationParams
{
    // Tìm theo tên người đánh giá hoặc nội dung nhận xét.
    public string? Search { get; set; }
}
