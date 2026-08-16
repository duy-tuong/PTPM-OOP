namespace CloudServiceStore.Application.Features.Customers.Auth.Dtos;

public class CustomerRegisterRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
