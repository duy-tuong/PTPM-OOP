using CloudServiceStore.Application.Features.Admin.Search.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Search;

public interface IAdminSearchService
{
    // `isAdmin` do Controller đọc thẳng từ claim role của JWT (không tin dữ liệu client gửi lên) -
    // quyết định có gộp thêm kết quả từ các entity Admin-only (Customer/User/ServicePlan/Promotion) hay
    // chỉ trả nhóm Admin+Editor (OrderRequest/ConsultationRequest/NewsArticle), đúng ranh giới quyền đã
    // áp dụng ở từng AdminXxxController tương ứng - Editor không được thấy dữ liệu họ vốn không có
    // quyền xem qua trang riêng, dù là qua ô tìm kiếm toàn cục.
    Task<AdminSearchResultDto> SearchAsync(string query, bool isAdmin, CancellationToken cancellationToken = default);
}
