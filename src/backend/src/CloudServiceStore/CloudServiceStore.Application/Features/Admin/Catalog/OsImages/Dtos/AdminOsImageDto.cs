namespace CloudServiceStore.Application.Features.Admin.Catalog.OsImages.Dtos;

public class AdminOsImageDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    // string (không phải enum) - khớp convention response DTO khác trong dự án (vd AdminAddonDto.Type).
    public string Family { get; init; } = string.Empty;
    public decimal? WindowsLicenseFeePerMonth { get; init; }
    public bool IsActive { get; init; }
    public int DisplayOrder { get; init; }
}
