using CloudServiceStore.Domain.Entities.Sales;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Sales;

public class OrderRequestItemConfiguration : IEntityTypeConfiguration<OrderRequestItem>
{
    public void Configure(EntityTypeBuilder<OrderRequestItem> builder)
    {
        builder.ToTable("OrderRequestItems");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.DomainName).HasMaxLength(100);
        builder.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
        builder.Property(x => x.LineTotal).HasColumnType("decimal(18,2)");

        builder.HasIndex(x => x.OrderRequestId);

        builder.HasOne(x => x.OrderRequest)
            .WithMany(x => x.Items)
            .HasForeignKey(x => x.OrderRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        // Restrict (không Cascade) - mirror đúng OrderRequestConfiguration cũ: ServicePlan/TldPricing
        // không bị xoá dây chuyền khi 1 dòng OrderRequestItem bị xoá.
        builder.HasOne(x => x.ServicePlan)
            .WithMany()
            .HasForeignKey(x => x.ServicePlanId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.TldPricing)
            .WithMany()
            .HasForeignKey(x => x.TldPricingId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
