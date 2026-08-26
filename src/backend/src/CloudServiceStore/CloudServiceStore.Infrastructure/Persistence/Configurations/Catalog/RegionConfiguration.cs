using CloudServiceStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Catalog;

public class RegionConfiguration : IEntityTypeConfiguration<Region>
{
    public void Configure(EntityTypeBuilder<Region> builder)
    {
        builder.ToTable("Regions");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasMaxLength(32);
        builder.Property(x => x.Name).HasMaxLength(100).IsRequired();
        builder.Property(x => x.City).HasMaxLength(50).IsRequired();
        builder.Property(x => x.CountryCode).HasMaxLength(2).IsRequired();

        // Danh sách cố định nhỏ, thuần trang trí - không có màn Admin CRUD riêng trong đợt này (xem
        // ServicePlan.cs), Admin chỉ chọn 1 trong các Region có sẵn khi tạo/sửa gói.
        builder.HasData(
            new Region { Id = "vn-han-1", Name = "Hà Nội DC", City = "Hà Nội", CountryCode = "VN", IsActive = true },
            new Region { Id = "vn-sgn-1", Name = "TP.HCM DC", City = "TP. Hồ Chí Minh", CountryCode = "VN", IsActive = true },
            new Region { Id = "sg-sin-1", Name = "Singapore DC", City = "Singapore", CountryCode = "SG", IsActive = true }
        );
    }
}
