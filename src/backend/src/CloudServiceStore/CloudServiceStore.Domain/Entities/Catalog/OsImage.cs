using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities.Catalog;

// Danh mục Hệ điều hành (Đợt 3, Phần 11) - độc lập với ServicePlan, gắn vào 1 hoặc nhiều plan qua
// ServicePlanOsImage, mirror y hệt Addon.cs. WindowsLicenseFeePerMonth là phí CỐ ĐỊNH/tháng (không
// nhân theo core) - gói Fixed không có cột vCPU số cứng (giữ nguyên PlanFeature key-value tự do, xem
// quyết định Đợt 1 Phần 1) nên không tính phí bản quyền theo core thật được, áp dụng đồng nhất cho cả
// Fixed lẫn Custom (quyết định đã chốt với người dùng).
public class OsImage
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public OsFamily Family { get; set; }

    // Chỉ có ý nghĩa khi Family = Windows - null/0 với Linux (miễn phí).
    public decimal? WindowsLicenseFeePerMonth { get; set; }

    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<ServicePlanOsImage> PlanOsImages { get; set; } = new List<ServicePlanOsImage>();
}
