using CloudServiceStore.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Identity;

public class AppUserRoleConfiguration : IEntityTypeConfiguration<AppUserRole>
{
    public void Configure(EntityTypeBuilder<AppUserRole> builder)
    {
        builder.ToTable("AppUserRoles");
        builder.HasKey(x => new { x.UserId, x.RoleId });

        builder.HasOne(x => x.User)
            .WithMany(x => x.UserRoles)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Role)
            .WithMany(x => x.UserRoles)
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        // Gán role Admin (Id=1) cho tài khoản admin demo seed ở AppUserConfiguration.
        builder.HasData(new AppUserRole
        {
            UserId = Guid.Parse("00000000-0000-0000-0000-000000000001"),
            RoleId = 1
        });
    }
}
