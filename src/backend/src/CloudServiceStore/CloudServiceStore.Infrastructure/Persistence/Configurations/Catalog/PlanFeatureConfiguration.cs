using CloudServiceStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Catalog;

public class PlanFeatureConfiguration : IEntityTypeConfiguration<PlanFeature>
{
    public void Configure(EntityTypeBuilder<PlanFeature> builder)
    {
        builder.ToTable("PlanFeatures");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.FeatureKey).HasMaxLength(100).IsRequired();
        builder.Property(x => x.FeatureLabel).HasMaxLength(200).IsRequired();
        builder.Property(x => x.FeatureValueText).HasMaxLength(200).IsRequired();
        builder.Property(x => x.FeatureValueNumeric).HasColumnType("decimal(18,4)");
        builder.Property(x => x.FeatureUnit).HasMaxLength(20);

        builder.HasIndex(x => new { x.PlanId, x.FeatureKey });
        builder.HasIndex(x => new { x.FeatureKey, x.FeatureValueNumeric });

        builder.HasOne(x => x.Plan)
            .WithMany(x => x.Features)
            .HasForeignKey(x => x.PlanId)
            .OnDelete(DeleteBehavior.Cascade);

        // Dữ liệu mẫu — 3 thông số (CPU/RAM/SSD) cho mỗi ServicePlan (Id 1, 2).
        builder.HasData(
            new PlanFeature { Id = 1, PlanId = 1, FeatureKey = "cpu", FeatureLabel = "CPU", FeatureValueText = "1 vCPU", FeatureValueNumeric = 1m, FeatureUnit = "core", DisplayOrder = 1, IsHighlighted = false },
            new PlanFeature { Id = 2, PlanId = 1, FeatureKey = "ram", FeatureLabel = "RAM", FeatureValueText = "1 GB", FeatureValueNumeric = 1m, FeatureUnit = "GB", DisplayOrder = 2, IsHighlighted = false },
            new PlanFeature { Id = 3, PlanId = 1, FeatureKey = "ssd", FeatureLabel = "Ổ cứng SSD", FeatureValueText = "20 GB", FeatureValueNumeric = 20m, FeatureUnit = "GB", DisplayOrder = 3, IsHighlighted = false },
            new PlanFeature { Id = 4, PlanId = 2, FeatureKey = "cpu", FeatureLabel = "CPU", FeatureValueText = "4 vCPU", FeatureValueNumeric = 4m, FeatureUnit = "core", DisplayOrder = 1, IsHighlighted = true },
            new PlanFeature { Id = 5, PlanId = 2, FeatureKey = "ram", FeatureLabel = "RAM", FeatureValueText = "8 GB", FeatureValueNumeric = 8m, FeatureUnit = "GB", DisplayOrder = 2, IsHighlighted = true },
            new PlanFeature { Id = 6, PlanId = 2, FeatureKey = "ssd", FeatureLabel = "Ổ cứng SSD", FeatureValueText = "120 GB", FeatureValueNumeric = 120m, FeatureUnit = "GB", DisplayOrder = 3, IsHighlighted = false }
        );
    }
}
