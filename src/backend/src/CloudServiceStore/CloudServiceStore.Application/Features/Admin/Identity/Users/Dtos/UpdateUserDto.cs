using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Admin.Identity.Users.Dtos;

public class UpdateUserDto
{
    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(100), EmailAddress]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    public bool IsActive { get; set; }

    public List<int> RoleIds { get; set; } = new();
}
