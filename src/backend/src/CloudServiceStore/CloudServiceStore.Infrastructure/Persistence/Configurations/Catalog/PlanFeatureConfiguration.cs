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
    }
}
