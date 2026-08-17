namespace CloudServiceStore.Application.Features.Admin.Catalog.TldPricings.Dtos;

public class AdminTldPricingDto
{
    public int Id { get; init; }
    public string Tld { get; init; } = string.Empty;
    public int? ServiceCategoryId { get; init; }
    public decimal RegisterPrice { get; init; }
    public decimal RenewPrice { get; init; }
    public decimal TransferPrice { get; init; }
    public string Currency { get; init; } = "VND";
    public bool IsActive { get; init; }
}
