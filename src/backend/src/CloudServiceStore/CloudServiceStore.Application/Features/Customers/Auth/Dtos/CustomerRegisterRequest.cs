using System.ComponentModel.DataAnnotations;
using CloudServiceStore.Application.Common.Utils;

namespace CloudServiceStore.Application.Features.Customers.Auth.Dtos;

public class CustomerRegisterRequest
{
    [Required(ErrorMessage = "Vui lòng nhập họ tên."), MinLength(2), MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập email.")]
    [EmailAddress(ErrorMessage = "Email không đúng định dạng."), MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập mật khẩu.")]
    [RegularExpression(PasswordPolicy.Pattern, ErrorMessage = PasswordPolicy.ErrorMessage)]
    public string Password { get; set; } = string.Empty;
}
