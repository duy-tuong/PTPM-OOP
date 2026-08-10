namespace CloudServiceStore.Application.Features.Auth.Dtos;

public class LoginRequest
{
    public string UsernameOrEmail { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
