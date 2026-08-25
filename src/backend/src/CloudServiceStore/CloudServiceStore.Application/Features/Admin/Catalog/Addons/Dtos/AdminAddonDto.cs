namespace CloudServiceStore.Application.Features.Admin.Catalog.Addons.Dtos;

public class AdminAddonDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Sku { get; init; } = string.Empty;
    // string (không phải enum) - khớp convention response DTO khác trong dự án (vd AdminServicePlanDto.Status).
    public string Type { get; init; } = string.Empty;
    public string BillingType { get; init; } = string.Empty;
    public string? UnitName { get; init; }
    public decimal PricePerMonth { get; init; }
    public bool IsActive { get; init; }
}
