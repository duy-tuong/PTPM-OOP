namespace CloudServiceStore.Domain.Entities.Catalog;

// Bảng nối N-N: OsImage nào được phép chọn khi mua ServicePlan nào - mirror y hệt ServicePlanAddon.
// Composite key (PlanId, OsImageId), xem ServicePlanOsImageConfiguration.cs. Không tự nó có giá riêng -
// giá (nếu Windows) luôn đọc trực tiếp từ OsImage.WindowsLicenseFeePerMonth tại thời điểm mua (không
// grandfathering, mirror Addon.cs).
public class ServicePlanOsImage
{
    public int PlanId { get; set; }
    public ServicePlan Plan { get; set; } = null!;

    public int OsImageId { get; set; }
    public OsImage OsImage { get; set; } = null!;

    // OS được chọn sẵn khi khách vào trang mua - chỉ mang tính hiển thị (frontend tự chọn 1 dòng
    // IsDefault=true nếu có), không unique-per-plan ở tầng DB (Admin có thể lỡ đánh dấu nhiều dòng
    // IsDefault, frontend chỉ lấy dòng đầu tiên tìm thấy - không phải lỗi nghiêm trọng cần validate cứng).
    public bool IsDefault { get; set; }
}
