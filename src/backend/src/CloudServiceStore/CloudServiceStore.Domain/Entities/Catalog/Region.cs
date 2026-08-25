namespace CloudServiceStore.Domain.Entities.Catalog;

// Bảng tra cứu Datacenter/Region - THUẦN TRANG TRÍ (quyết định phạm vi đã chốt với người dùng): không
// có hạ tầng ảo hóa thật đứng sau nên không theo dõi capacity/stock theo Region, không có bảng giá
// riêng theo Region. Id dạng slug (vd "vn-han-1") thay vì int identity - đọc trực tiếp có ý nghĩa hơn
// khi debug/seed, và không có nhu cầu đổi tên/khoá ngoại phức tạp cho 1 danh sách cố định nhỏ.
public class Region
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string CountryCode { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
