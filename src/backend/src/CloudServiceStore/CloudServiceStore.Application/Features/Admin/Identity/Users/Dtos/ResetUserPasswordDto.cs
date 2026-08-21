using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Admin.Identity.Users.Dtos;

public class ResetUserPasswordDto
{
    [Required]
    public string NewPassword { get; set; } = string.Empty;
}
