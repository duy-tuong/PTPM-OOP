using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Customers.Auth.Dtos;

public class ForgotPasswordRequest
{
    [Required(ErrorMessage = "Vui lòng nhập email.")]
    [EmailAddress(ErrorMessage = "Email không đúng định dạng.")]
    public string Email { get; set; } = string.Empty;
}
