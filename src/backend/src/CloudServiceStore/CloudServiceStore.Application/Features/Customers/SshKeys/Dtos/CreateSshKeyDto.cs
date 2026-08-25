using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Customers.SshKeys.Dtos;

public class CreateSshKeyDto
{
    [Required, MaxLength(100)]
    public string Label { get; set; } = string.Empty;

    [Required, MaxLength(2000)]
    public string PublicKey { get; set; } = string.Empty;
}
