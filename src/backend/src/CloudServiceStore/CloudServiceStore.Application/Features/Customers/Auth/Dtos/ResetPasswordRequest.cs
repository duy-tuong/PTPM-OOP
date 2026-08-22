namespace CloudServiceStore.Application.Features.Customers.Auth.Dtos;

public class ResetPasswordRequest
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
