using CloudServiceStore.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Identity;

public class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
{
    public void Configure(EntityTypeBuilder<AppUser> builder)
    {
        builder.ToTable("AppUsers");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Username).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(100).IsRequired();
        builder.Property(x => x.PasswordHash).HasMaxLength(255).IsRequired();
        builder.Property(x => x.FullName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.PhoneNumber).HasMaxLength(20);
        builder.Property(x => x.RefreshToken).HasMaxLength(500);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(x => x.Username).IsUnique();
        builder.HasIndex(x => x.Email).IsUnique();

        builder.HasQueryFilter(x => !x.IsDeleted);

        // Tài khoản Admin demo cho báo cáo/nộp bài — mật khẩu "Admin@123" (hash BCrypt tính sẵn,
        // không gọi BCrypt.HashPassword() trực tiếp ở đây vì salt ngẫu nhiên sẽ đổi mỗi lần add-migration).
        builder.HasData(new AppUser
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
            Username = "admin",
            Email = "admin@cloudservicestore.local",
            PasswordHash = "$2a$12$5HZRDTIWE.Z5SFHppw.joeiJgmEq4xF8SPF842cptbiiRInG7YAHy",
            FullName = "System Administrator",
            IsActive = true,
            IsDeleted = false,
            CreatedAt = new DateTime(2026, 8, 10, 0, 0, 0, DateTimeKind.Utc)
        });
    }
}
