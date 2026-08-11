namespace CloudServiceStore.Application.Features.Content.Partners.Dtos;

public class PartnerDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string LogoUrl { get; init; } = string.Empty;
    public string? WebsiteUrl { get; init; }
    public int DisplayOrder { get; init; }
}
