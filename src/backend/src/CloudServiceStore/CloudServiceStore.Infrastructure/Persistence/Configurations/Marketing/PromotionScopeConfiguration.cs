using CloudServiceStore.Domain.Entities.Marketing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Marketing;

public class PromotionScopeConfiguration : IEntityTypeConfiguration<PromotionScope>
{
    public void Configure(EntityTypeBuilder<PromotionScope> builder)
    {
        builder.ToTable("PromotionScopes");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ScopeType).HasConversion<int>();

        builder.HasIndex(x => x.PromotionId);
        builder.HasIndex(x => x.ServicePlanId);
        builder.HasIndex(x => x.ServiceCategoryId);

        builder.HasOne(x => x.Promotion)
            .WithMany(x => x.Scopes)
            .HasForeignKey(x => x.PromotionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Restrict (không Cascade) vì ServicePlan cũng cascade từ ServiceCategory —
        // để Cascade ở đây sẽ tạo nhiều đường cascade tới cùng 1 bảng, SQL Server sẽ từ chối tạo schema.
        builder.HasOne(x => x.ServiceCategory)
            .WithMany()
            .HasForeignKey(x => x.ServiceCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ServicePlan)
            .WithMany()
            .HasForeignKey(x => x.ServicePlanId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
