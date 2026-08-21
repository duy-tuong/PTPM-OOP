using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Content;

public class PartnerConfiguration : IEntityTypeConfiguration<Partner>
{
    public void Configure(EntityTypeBuilder<Partner> builder)
    {
        builder.ToTable("Partners");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).HasMaxLength(150).IsRequired();
        builder.Property(x => x.LogoUrl).HasMaxLength(500).IsRequired();
        builder.Property(x => x.WebsiteUrl).HasMaxLength(500);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(x => new { x.IsActive, x.DisplayOrder });

        builder.HasQueryFilter(x => !x.IsDeleted);

        // Dữ liệu mẫu.
        builder.HasData(new Partner
        {
            Id = 1,
            Name = "TechCorp Vietnam",
            LogoUrl = "https://cloudservicestore.local/partners/techcorp.png",
            WebsiteUrl = "https://techcorp.example.com",
            DisplayOrder = 1,
            IsActive = true,
            IsDeleted = false,
            CreatedAt = new DateTime(2026, 8, 10, 0, 0, 0, DateTimeKind.Utc)
        });
    }
}
