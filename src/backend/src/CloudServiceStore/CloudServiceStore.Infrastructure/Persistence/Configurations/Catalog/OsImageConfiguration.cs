using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Catalog;

public class OsImageConfiguration : IEntityTypeConfiguration<OsImage>
{
    public void Configure(EntityTypeBuilder<OsImage> builder)
    {
        builder.ToTable("OsImages");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Slug).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Family).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(x => x.WindowsLicenseFeePerMonth).HasColumnType("decimal(18,2)");
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(x => x.Slug).IsUnique();

        // Dữ liệu mẫu để demo/kiểm thử luồng chọn OS lúc mua.
        var seedCreatedAt = new DateTime(2026, 8, 25, 0, 0, 0, DateTimeKind.Utc);
        builder.HasData(
            new OsImage { Id = 1, Name = "Ubuntu 24.04 LTS", Slug = "ubuntu-24-04", Family = OsFamily.Linux, IsActive = true, DisplayOrder = 1, CreatedAt = seedCreatedAt },
            new OsImage { Id = 2, Name = "Ubuntu 22.04 LTS", Slug = "ubuntu-22-04", Family = OsFamily.Linux, IsActive = true, DisplayOrder = 2, CreatedAt = seedCreatedAt },
            new OsImage { Id = 3, Name = "Debian 12", Slug = "debian-12", Family = OsFamily.Linux, IsActive = true, DisplayOrder = 3, CreatedAt = seedCreatedAt },
            new OsImage { Id = 4, Name = "AlmaLinux 9", Slug = "almalinux-9", Family = OsFamily.Linux, IsActive = true, DisplayOrder = 4, CreatedAt = seedCreatedAt },
            new OsImage { Id = 5, Name = "Rocky Linux 9", Slug = "rocky-linux-9", Family = OsFamily.Linux, IsActive = true, DisplayOrder = 5, CreatedAt = seedCreatedAt },
            new OsImage { Id = 6, Name = "Windows Server 2022 Standard", Slug = "windows-server-2022", Family = OsFamily.Windows, WindowsLicenseFeePerMonth = 350000m, IsActive = true, DisplayOrder = 6, CreatedAt = seedCreatedAt },
            new OsImage { Id = 7, Name = "Windows Server 2019 Standard", Slug = "windows-server-2019", Family = OsFamily.Windows, WindowsLicenseFeePerMonth = 300000m, IsActive = true, DisplayOrder = 7, CreatedAt = seedCreatedAt }
        );
    }
}
