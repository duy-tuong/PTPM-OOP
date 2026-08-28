using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Application.Features.Admin.Content.Faqs.Dtos;

public class FaqQueryParams : PaginationParams
{
    // Tìm theo câu hỏi hoặc câu trả lời.
    public string? Search { get; set; }
}
