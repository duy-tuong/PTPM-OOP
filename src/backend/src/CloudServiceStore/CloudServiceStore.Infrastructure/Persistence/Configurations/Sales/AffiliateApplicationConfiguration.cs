using CloudServiceStore.Domain.Entities.Sales;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Sales;

public class AffiliateApplicationConfiguration : IEntityTypeConfiguration<AffiliateApplication>
{
    public void Configure(EntityTypeBuilder<AffiliateApplication> builder)
    {
        builder.ToTable("AffiliateApplications");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.FullName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Phone).HasMaxLength(20).IsRequired();
        builder.Property(x => x.WebsiteUrl).HasMaxLength(255);
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.Property(x => x.ReviewNote).HasMaxLength(1000);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(x => new { x.Status, x.CreatedAt });

        builder.HasOne(x => x.ReviewedByUser)
            .WithMany()
            .HasForeignKey(x => x.ReviewedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
