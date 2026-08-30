namespace CloudServiceStore.Application.Features.Customers.Auth.Dtos;

public class CustomerAuthResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public string FullName { get; set; } = string.Empty;
    // Giỏ hàng cần 1 định danh ổn định gắn theo tài khoản để tách riêng giỏ hàng từng khách trên cùng 1
    // trình duyệt (localStorage, xem CartContext.tsx) - trước đây response chỉ có FullName (không duy
    // nhất, có thể trùng giữa 2 khách khác nhau) nên không dùng làm khoá được. Email luôn duy nhất
    // (unique index ở CSDL) và không nhạy cảm hơn FullName đã lộ sẵn qua cookie customer_session.
    public string Email { get; set; } = string.Empty;
}
