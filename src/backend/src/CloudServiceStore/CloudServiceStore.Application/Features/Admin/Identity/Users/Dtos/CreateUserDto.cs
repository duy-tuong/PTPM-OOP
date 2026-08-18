using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Admin.Identity.Users.Dtos;

public class CreateUserDto
{
    [Required, MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required, MaxLength(100), EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    [Required]
    public string Password { get; set; } = string.Empty;

    public List<int> RoleIds { get; set; } = new();
}
