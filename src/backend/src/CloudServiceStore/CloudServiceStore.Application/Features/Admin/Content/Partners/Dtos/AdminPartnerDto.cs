namespace CloudServiceStore.Application.Features.Admin.Content.Partners.Dtos;

public class AdminPartnerDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string LogoUrl { get; init; } = string.Empty;
    public string? WebsiteUrl { get; init; }
    public int DisplayOrder { get; init; }
    public bool IsActive { get; init; }
}
