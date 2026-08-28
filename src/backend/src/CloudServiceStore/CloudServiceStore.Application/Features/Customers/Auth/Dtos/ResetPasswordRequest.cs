using System.ComponentModel.DataAnnotations;
using CloudServiceStore.Application.Common.Utils;

namespace CloudServiceStore.Application.Features.Customers.Auth.Dtos;

public class ResetPasswordRequest
{
    [Required(ErrorMessage = "Token không hợp lệ.")]
    public string Token { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập mật khẩu mới.")]
    [RegularExpression(PasswordPolicy.Pattern, ErrorMessage = PasswordPolicy.ErrorMessage)]
    public string NewPassword { get; set; } = string.Empty;
}
