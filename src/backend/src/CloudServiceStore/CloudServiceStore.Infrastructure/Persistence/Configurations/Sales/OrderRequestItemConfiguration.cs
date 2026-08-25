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
        builder.Property(x => x.ProvisionedIpAddress).HasMaxLength(45);
        builder.Property(x => x.ProvisionedRootPassword).HasMaxLength(100);
        builder.Property(x => x.ProvisionedNameservers).HasMaxLength(200);

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

        // Restrict - PlanPrice bị "đóng" (IsCurrent=false) chứ không bao giờ bị xoá cứng (xem
        // AdminServicePlanService.UpdateAsync), nên Cascade không cần thiết; Restrict an toàn hơn.
        builder.HasOne(x => x.PlanPrice)
            .WithMany()
            .HasForeignKey(x => x.PlanPriceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.RenewsFromItemId);

        // Self-referencing, Restrict (không Cascade) - mirror ServicePlan/TldPricing: item gốc không
        // bị xoá dây chuyền khi 1 item gia hạn (con) bị xoá.
        builder.HasOne(x => x.RenewsFromItem)
            .WithMany()
            .HasForeignKey(x => x.RenewsFromItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.ChangesFromItemId);

        // Self-referencing, Restrict - cùng lý do RenewsFromItemId ở trên.
        builder.HasOne(x => x.ChangesFromItem)
            .WithMany()
            .HasForeignKey(x => x.ChangesFromItemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
