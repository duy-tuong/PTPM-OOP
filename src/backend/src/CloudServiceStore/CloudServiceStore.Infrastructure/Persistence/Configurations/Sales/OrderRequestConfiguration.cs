using CloudServiceStore.Domain.Entities.Sales;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Sales;

public class OrderRequestConfiguration : IEntityTypeConfiguration<OrderRequest>
{
    public void Configure(EntityTypeBuilder<OrderRequest> builder)
    {
        builder.ToTable("OrderRequests");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.OrderCode).HasMaxLength(20).IsRequired();
        builder.Property(x => x.CustomerType).HasConversion<int>();
        builder.Property(x => x.CustomerName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.CustomerEmail).HasMaxLength(100).IsRequired();
        builder.Property(x => x.CustomerPhone).HasMaxLength(20).IsRequired();
        builder.Property(x => x.CompanyName).HasMaxLength(150);
        builder.Property(x => x.TaxCode).HasMaxLength(20);
        builder.Property(x => x.DomainName).HasMaxLength(100);
        builder.Property(x => x.TotalPrice).HasColumnType("decimal(18,2)");
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.Property(x => x.Source).HasMaxLength(50);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(x => x.OrderCode).IsUnique();
        builder.HasIndex(x => new { x.Status, x.CreatedAt });
        builder.HasIndex(x => x.CustomerId);
        builder.HasIndex(x => x.AssignedToUserId);

        builder.HasOne(x => x.Customer)
            .WithMany()
            .HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.ServicePlan)
            .WithMany()
            .HasForeignKey(x => x.ServicePlanId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.TldPricing)
            .WithMany()
            .HasForeignKey(x => x.TldPricingId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Promotion)
            .WithMany()
            .HasForeignKey(x => x.PromotionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.AssignedToUser)
            .WithMany()
            .HasForeignKey(x => x.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
