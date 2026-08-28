namespace CloudServiceStore.Application.Features.Admin.Search.Dtos;

// 1 kết quả tìm kiếm - đủ để render 1 dòng trong Command Palette và điều hướng khi bấm vào, không cần
// frontend tự suy luận URL/nhãn hiển thị theo từng loại entity khác nhau.
public class AdminSearchResultItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }

    // Với entity có trang chi tiết/sửa riêng (Customer/ServicePlan/NewsArticle) -> link thẳng vào đó.
    // Với entity chỉ quản lý qua Dialog trên 1 trang danh sách (OrderRequest/ConsultationRequest/User/
    // Promotion) -> link tới trang danh sách kèm ?search=<từ khoá định danh> (đã hỗ trợ ở từng
    // Admin*QueryParams tương ứng), để đúng dòng cần tìm tự lọc ra ngay khi tới nơi.
    public string Url { get; set; } = string.Empty;
}

// Gom theo nhóm (thay vì 1 mảng phẳng) để Command Palette hiển thị có tiêu đề nhóm rõ ràng - mỗi nhóm
// giới hạn top N kết quả (xem AdminSearchService), không phải phân trang đầy đủ.
public class AdminSearchResultDto
{
    public List<AdminSearchResultItemDto> Customers { get; set; } = new();
    public List<AdminSearchResultItemDto> OrderRequests { get; set; } = new();
    public List<AdminSearchResultItemDto> ConsultationRequests { get; set; } = new();
    public List<AdminSearchResultItemDto> Users { get; set; } = new();
    public List<AdminSearchResultItemDto> ServicePlans { get; set; } = new();
    public List<AdminSearchResultItemDto> NewsArticles { get; set; } = new();
    public List<AdminSearchResultItemDto> Promotions { get; set; } = new();
}
