using CloudServiceStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Catalog;

public class ServicePlanOsImageConfiguration : IEntityTypeConfiguration<ServicePlanOsImage>
{
    public void Configure(EntityTypeBuilder<ServicePlanOsImage> builder)
    {
        builder.ToTable("ServicePlanOsImages");
        builder.HasKey(x => new { x.PlanId, x.OsImageId });

        builder.HasOne(x => x.Plan)
            .WithMany(x => x.PlanOsImages)
            .HasForeignKey(x => x.PlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.OsImage)
            .WithMany(x => x.PlanOsImages)
            .HasForeignKey(x => x.OsImageId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
