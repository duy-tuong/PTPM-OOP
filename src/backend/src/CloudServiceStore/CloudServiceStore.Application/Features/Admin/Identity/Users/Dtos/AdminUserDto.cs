namespace CloudServiceStore.Application.Features.Admin.Identity.Users.Dtos;

public class AdminUserDto
{
    public Guid Id { get; init; }
    public string Username { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public string? PhoneNumber { get; init; }
    public bool IsActive { get; init; }
    public List<string> Roles { get; init; } = new();
    public DateTime CreatedAt { get; init; }
}
