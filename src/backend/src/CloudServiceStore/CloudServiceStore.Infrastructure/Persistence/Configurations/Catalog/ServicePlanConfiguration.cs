using CloudServiceStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Catalog;

public class ServicePlanConfiguration : IEntityTypeConfiguration<ServicePlan>
{
    public void Configure(EntityTypeBuilder<ServicePlan> builder)
    {
        builder.ToTable("ServicePlans");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Slug).HasMaxLength(120).IsRequired();
        builder.Property(x => x.ShortDescription).HasMaxLength(500);
        builder.Property(x => x.QrCodeUrl).HasMaxLength(500);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(x => x.Slug).IsUnique();
        builder.HasIndex(x => new { x.CategoryId, x.IsActive });

        builder.HasOne(x => x.Category)
            .WithMany(x => x.Plans)
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(x => !x.IsDeleted);

        // Dữ liệu mẫu để demo/kiểm thử API Phase 3 (Catalog công khai).
        var seedCreatedAt = new DateTime(2026, 8, 10, 0, 0, 0, DateTimeKind.Utc);
        builder.HasData(
            new ServicePlan
            {
                Id = 1,
                CategoryId = 1,
                Name = "VPS SSD Starter",
                Slug = "vps-ssd-starter",
                ShortDescription = "Khởi đầu tiết kiệm cho website/app nhỏ.",
                Description = "Gói VPS SSD Starter phù hợp cho website cá nhân, blog, ứng dụng nhỏ cần tài nguyên vừa phải.",
                IsFeatured = false,
                IsActive = true,
                DisplayOrder = 1,
                IsDeleted = false,
                CreatedAt = seedCreatedAt
            },
            new ServicePlan
            {
                Id = 2,
                CategoryId = 1,
                Name = "VPS SSD Business",
                Slug = "vps-ssd-business",
                ShortDescription = "Hiệu năng cao cho doanh nghiệp.",
                Description = "Gói VPS SSD Business dành cho ứng dụng doanh nghiệp cần hiệu năng ổn định, tài nguyên lớn.",
                IsFeatured = true,
                IsActive = true,
                DisplayOrder = 2,
                IsDeleted = false,
                CreatedAt = seedCreatedAt
            }
        );
    }
}
