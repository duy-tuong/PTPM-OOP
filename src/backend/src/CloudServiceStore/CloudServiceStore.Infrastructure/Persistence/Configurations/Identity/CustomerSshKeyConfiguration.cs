using CloudServiceStore.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Identity;

public class CustomerSshKeyConfiguration : IEntityTypeConfiguration<CustomerSshKey>
{
    public void Configure(EntityTypeBuilder<CustomerSshKey> builder)
    {
        builder.ToTable("CustomerSshKeys");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Label).HasMaxLength(100).IsRequired();
        // ssh-ed25519 key ~100 ký tự, ssh-rsa 4096-bit ~700 ký tự kèm comment - 2000 đủ dư cho mọi loại
        // key phổ biến.
        builder.Property(x => x.PublicKey).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(x => x.CustomerId);

        // Cascade - xoá tài khoản khách hàng thì xoá luôn key đã lưu (không có gì tham chiếu ngược,
        // xem CustomerSshKey.cs).
        builder.HasOne(x => x.Customer)
            .WithMany(x => x.SshKeys)
            .HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
