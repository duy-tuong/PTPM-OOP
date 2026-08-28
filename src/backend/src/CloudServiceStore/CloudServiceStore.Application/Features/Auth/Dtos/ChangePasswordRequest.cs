using System.ComponentModel.DataAnnotations;
using CloudServiceStore.Application.Common.Utils;

namespace CloudServiceStore.Application.Features.Auth.Dtos;

// Dùng chung cho cả AuthController (Admin/Editor) lẫn CustomerAuthController - PasswordPolicy áp dụng
// đồng nhất cho mọi loại tài khoản khi đổi mật khẩu.
public class ChangePasswordRequest
{
    [Required(ErrorMessage = "Vui lòng nhập mật khẩu hiện tại.")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập mật khẩu mới.")]
    [RegularExpression(PasswordPolicy.Pattern, ErrorMessage = PasswordPolicy.ErrorMessage)]
    public string NewPassword { get; set; } = string.Empty;
}
