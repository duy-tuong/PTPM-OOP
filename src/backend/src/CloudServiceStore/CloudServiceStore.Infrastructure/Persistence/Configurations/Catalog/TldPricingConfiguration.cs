using CloudServiceStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Catalog;

public class TldPricingConfiguration : IEntityTypeConfiguration<TldPricing>
{
    public void Configure(EntityTypeBuilder<TldPricing> builder)
    {
        builder.ToTable("TldPricing");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Tld).HasMaxLength(20).IsRequired();
        builder.Property(x => x.RegisterPrice).HasColumnType("decimal(18,2)");
        builder.Property(x => x.RenewPrice).HasColumnType("decimal(18,2)");
        builder.Property(x => x.TransferPrice).HasColumnType("decimal(18,2)");
        builder.Property(x => x.Currency).HasMaxLength(3).IsRequired();
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(x => x.Tld).IsUnique();
        builder.HasIndex(x => x.IsActive);

        builder.HasOne(x => x.ServiceCategory)
            .WithMany()
            .HasForeignKey(x => x.ServiceCategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
