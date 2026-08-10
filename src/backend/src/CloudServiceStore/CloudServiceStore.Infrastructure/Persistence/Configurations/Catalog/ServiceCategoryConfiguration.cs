using CloudServiceStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Catalog;

public class ServiceCategoryConfiguration : IEntityTypeConfiguration<ServiceCategory>
{
    public void Configure(EntityTypeBuilder<ServiceCategory> builder)
    {
        builder.ToTable("ServiceCategories");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Slug).HasMaxLength(120).IsRequired();
        builder.Property(x => x.IconUrl).HasMaxLength(500);

        builder.HasIndex(x => x.Slug).IsUnique();

        builder.HasQueryFilter(x => !x.IsDeleted);

        // 6 danh mục dịch vụ theo đúng mục 3.1.3 đề bài.
        builder.HasData(
            new ServiceCategory { Id = 1, Name = "VPS", Slug = "vps", Description = "Máy chủ ảo hiệu năng cao, nhiều cấu hình CPU/RAM/SSD.", DisplayOrder = 1, IsActive = true, IsDeleted = false },
            new ServiceCategory { Id = 2, Name = "Hosting", Slug = "hosting", Description = "Lưu trữ website, hỗ trợ đa nền tảng (WordPress, PHP, .NET...).", DisplayOrder = 2, IsActive = true, IsDeleted = false },
            new ServiceCategory { Id = 3, Name = "Domain", Slug = "domain", Description = "Đăng ký và quản lý tên miền với nhiều đuôi phổ biến.", DisplayOrder = 3, IsActive = true, IsDeleted = false },
            new ServiceCategory { Id = 4, Name = "Email doanh nghiệp", Slug = "email-doanh-nghiep", Description = "Email theo tên miền riêng, bảo mật và chuyên nghiệp.", DisplayOrder = 4, IsActive = true, IsDeleted = false },
            new ServiceCategory { Id = 5, Name = "SSL", Slug = "ssl", Description = "Chứng chỉ bảo mật SSL/TLS cho website.", DisplayOrder = 5, IsActive = true, IsDeleted = false },
            new ServiceCategory { Id = 6, Name = "Firewall chống DDoS", Slug = "firewall-chong-ddos", Description = "Giải pháp tường lửa và chống tấn công DDoS.", DisplayOrder = 6, IsActive = true, IsDeleted = false }
        );
    }
}
