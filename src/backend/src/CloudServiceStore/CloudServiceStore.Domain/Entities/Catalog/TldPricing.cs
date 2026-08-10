using CloudServiceStore.Domain.Common;

namespace CloudServiceStore.Domain.Entities.Catalog;

public class TldPricing : ISoftDelete
{
    public int Id { get; set; }
    public string Tld { get; set; } = string.Empty;

    public int? ServiceCategoryId { get; set; }
    public ServiceCategory? ServiceCategory { get; set; }

    public decimal RegisterPrice { get; set; }
    public decimal RenewPrice { get; set; }
    public decimal TransferPrice { get; set; }
    public string Currency { get; set; } = "VND";
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
