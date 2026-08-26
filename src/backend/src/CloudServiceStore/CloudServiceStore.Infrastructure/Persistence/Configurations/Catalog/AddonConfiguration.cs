using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Catalog;

public class AddonConfiguration : IEntityTypeConfiguration<Addon>
{
    public void Configure(EntityTypeBuilder<Addon> builder)
    {
        builder.ToTable("Addons");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Sku).HasMaxLength(64).IsRequired();
        builder.Property(x => x.UnitName).HasMaxLength(20);
        builder.Property(x => x.PricePerMonth).HasColumnType("decimal(18,2)");
        builder.Property(x => x.Type).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(x => x.BillingType).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(x => x.Sku).IsUnique();

        // Dữ liệu mẫu để demo/kiểm thử luồng mua kèm addon.
        var seedCreatedAt = new DateTime(2026, 8, 25, 0, 0, 0, DateTimeKind.Utc);
        builder.HasData(
            new Addon { Id = 1, Name = "IPv4 phụ", Sku = "ADDON-IP-V4", Type = AddonType.Ip, BillingType = AddonBillingType.PerUnit, UnitName = "IP", PricePerMonth = 30000m, IsActive = true, CreatedAt = seedCreatedAt },
            new Addon { Id = 2, Name = "Ổ đĩa NVMe bổ sung", Sku = "ADDON-DISK-NVME", Type = AddonType.Disk, BillingType = AddonBillingType.PerUnit, UnitName = "GB", PricePerMonth = 2000m, IsActive = true, CreatedAt = seedCreatedAt },
            new Addon { Id = 3, Name = "Sao lưu tự động hàng ngày", Sku = "ADDON-AUTOBACKUP", Type = AddonType.ManagedService, BillingType = AddonBillingType.FlatFee, PricePerMonth = 50000m, IsActive = true, CreatedAt = seedCreatedAt },
            new Addon { Id = 4, Name = "Bản quyền Windows Server", Sku = "ADDON-LIC-WINDOWS", Type = AddonType.License, BillingType = AddonBillingType.FlatFee, PricePerMonth = 250000m, IsActive = true, CreatedAt = seedCreatedAt }
        );
    }
}
