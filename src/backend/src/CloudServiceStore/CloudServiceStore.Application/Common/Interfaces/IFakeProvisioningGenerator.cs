namespace CloudServiceStore.Application.Common.Interfaces;

// Sinh dữ liệu bàn giao giả lập (Tier 3 - "cấp phát tự động") - KHÔNG phải hạ tầng thật, chỉ cần
// đúng hình dạng để demo. Dùng ở OrderRequestStatusTransitionService lúc đơn chuyển Completed.
public interface IFakeProvisioningGenerator
{
    // hasSshKey (Đợt 3, Phần 12): true -> RootPassword = null (không sinh mật khẩu - đúng thực tế các
    // nhà cung cấp cloud thật tắt hẳn đăng nhập bằng mật khẩu khi khách cung cấp SSH key).
    (string IpAddress, string? RootPassword) GenerateServerCredentials(bool hasSshKey);

    string GenerateNameservers();
}
