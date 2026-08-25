using CloudServiceStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Catalog;

public class PlanPriceConfiguration : IEntityTypeConfiguration<PlanPrice>
{
    public void Configure(EntityTypeBuilder<PlanPrice> builder)
    {
        builder.ToTable("PlanPrices");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Price).HasColumnType("decimal(18,2)");
        builder.Property(x => x.PromotionalPrice).HasColumnType("decimal(18,2)");
        builder.Property(x => x.Currency).HasMaxLength(3).IsRequired();
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.EffectiveFrom).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(x => new { x.PlanId, x.PeriodMonths, x.IsActive });
        // Tra giá bán hiện hành (BuildServicePlanItemAsync lọc IsCurrent && IsActive).
        builder.HasIndex(x => new { x.PlanId, x.IsCurrent });

        builder.HasOne(x => x.Plan)
            .WithMany(x => x.Prices)
            .HasForeignKey(x => x.PlanId)
            .OnDelete(DeleteBehavior.Cascade);

        // Dữ liệu mẫu — mỗi ServicePlan (Id 1, 2 ở ServicePlanConfiguration) có giá theo tháng và theo năm.
        var seedCreatedAt = new DateTime(2026, 8, 10, 0, 0, 0, DateTimeKind.Utc);
        builder.HasData(
            new PlanPrice { Id = 1, PlanId = 1, PeriodMonths = 1, Price = 99000m, PromotionalPrice = null, Currency = "VND", IsDefault = true, IsActive = true, Version = 1, IsCurrent = true, EffectiveFrom = seedCreatedAt, CreatedAt = seedCreatedAt },
            new PlanPrice { Id = 2, PlanId = 1, PeriodMonths = 12, Price = 1069000m, PromotionalPrice = 990000m, Currency = "VND", IsDefault = false, IsActive = true, Version = 1, IsCurrent = true, EffectiveFrom = seedCreatedAt, CreatedAt = seedCreatedAt },
            new PlanPrice { Id = 3, PlanId = 2, PeriodMonths = 1, Price = 299000m, PromotionalPrice = null, Currency = "VND", IsDefault = true, IsActive = true, Version = 1, IsCurrent = true, EffectiveFrom = seedCreatedAt, CreatedAt = seedCreatedAt },
            new PlanPrice { Id = 4, PlanId = 2, PeriodMonths = 12, Price = 3229000m, PromotionalPrice = 2990000m, Currency = "VND", IsDefault = false, IsActive = true, Version = 1, IsCurrent = true, EffectiveFrom = seedCreatedAt, CreatedAt = seedCreatedAt }
        );
    }
}
