using CloudServiceStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Catalog;

public class ServicePlanAddonConfiguration : IEntityTypeConfiguration<ServicePlanAddon>
{
    public void Configure(EntityTypeBuilder<ServicePlanAddon> builder)
    {
        builder.ToTable("ServicePlanAddons");
        builder.HasKey(x => new { x.PlanId, x.AddonId });

        builder.HasOne(x => x.Plan)
            .WithMany(x => x.PlanAddons)
            .HasForeignKey(x => x.PlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Addon)
            .WithMany(x => x.PlanAddons)
            .HasForeignKey(x => x.AddonId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
