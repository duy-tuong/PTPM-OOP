using CloudServiceStore.Domain.Entities.System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.System;

public class SiteSettingConfiguration : IEntityTypeConfiguration<SiteSetting>
{
    public void Configure(EntityTypeBuilder<SiteSetting> builder)
    {
        builder.ToTable("SiteSettings");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.SettingKey).HasMaxLength(100).IsRequired();
        builder.Property(x => x.SettingValue).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.SettingGroup).HasMaxLength(50).IsRequired();
        builder.Property(x => x.DataType).HasMaxLength(20).IsRequired();

        builder.HasIndex(x => x.SettingKey).IsUnique();

        builder.HasOne(x => x.UpdatedByUser)
            .WithMany()
            .HasForeignKey(x => x.UpdatedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
