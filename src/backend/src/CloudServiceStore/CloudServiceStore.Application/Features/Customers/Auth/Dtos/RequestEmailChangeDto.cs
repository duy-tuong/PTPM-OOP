using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Customers.Auth.Dtos;

public class RequestEmailChangeDto
{
    [Required, EmailAddress, MaxLength(100)]
    public string NewEmail { get; set; } = string.Empty;
}
