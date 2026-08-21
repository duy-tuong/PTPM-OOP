using CloudServiceStore.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Identity;

public class AppRoleConfiguration : IEntityTypeConfiguration<AppRole>
{
    public void Configure(EntityTypeBuilder<AppRole> builder)
    {
        builder.ToTable("AppRoles");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(250);

        builder.HasIndex(x => x.Name).IsUnique();

        builder.HasData(
            new AppRole { Id = 1, Name = "Admin", Description = "Quản trị hệ thống" },
            new AppRole { Id = 2, Name = "Editor", Description = "Biên tập nội dung" },
            new AppRole { Id = 3, Name = "Customer", Description = "Khách hàng tự đăng ký" }
        );
    }
}
