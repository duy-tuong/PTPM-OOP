namespace CloudServiceStore.Application.Features.Catalog.TldPricings.Dtos;

public class TldPricingDto
{
    public int Id { get; init; }
    public string Tld { get; init; } = string.Empty;
    public string? ServiceCategoryName { get; init; }
    public decimal RegisterPrice { get; init; }
    public decimal RenewPrice { get; init; }
    public decimal TransferPrice { get; init; }
    public string Currency { get; init; } = "VND";
}
