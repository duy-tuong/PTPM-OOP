namespace CloudServiceStore.Application.Common.Interfaces;

// Sinh dữ liệu bàn giao giả lập (Tier 3 - "cấp phát tự động") - KHÔNG phải hạ tầng thật, chỉ cần
// đúng hình dạng để demo. Dùng ở OrderRequestStatusTransitionService lúc đơn chuyển Completed.
public interface IFakeProvisioningGenerator
{
    (string IpAddress, string RootPassword) GenerateServerCredentials();

    string GenerateNameservers();
}
