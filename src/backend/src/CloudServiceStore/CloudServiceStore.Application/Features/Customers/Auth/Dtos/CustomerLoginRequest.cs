using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Customers.Auth.Dtos;

public class CustomerLoginRequest
{
    [Required(ErrorMessage = "Vui lòng nhập email.")]
    [EmailAddress(ErrorMessage = "Email không đúng định dạng.")]
    public string Email { get; set; } = string.Empty;

    // Cố tình KHÔNG áp PasswordPolicy ở đây (khác NewPassword ở Register/ChangePassword/ResetPassword) -
    // tài khoản tạo trước khi có chính sách mật khẩu mạnh vẫn phải đăng nhập được bằng mật khẩu cũ, chỉ
    // cần không rỗng.
    [Required(ErrorMessage = "Vui lòng nhập mật khẩu.")]
    public string Password { get; set; } = string.Empty;
}
