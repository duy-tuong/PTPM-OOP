using CloudServiceStore.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Identity;

public class CustomerNotificationConfiguration : IEntityTypeConfiguration<CustomerNotification>
{
    public void Configure(EntityTypeBuilder<CustomerNotification> builder)
    {
        builder.ToTable("CustomerNotifications");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Message).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.LinkUrl).HasMaxLength(200);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        // Phục vụ 2 truy vấn chính: đếm/lọc chưa đọc theo khách (GetUnreadCountAsync), và liệt kê mới
        // nhất trước (GetMineAsync) - gộp chung 1 index phủ cả 2 nhờ (CustomerId, IsRead) là tiền tố của
        // (CustomerId, IsRead, CreatedAt).
        builder.HasIndex(x => new { x.CustomerId, x.IsRead, x.CreatedAt });

        // Cascade - xoá tài khoản khách hàng thì xoá luôn thông báo (không có gì tham chiếu ngược, mirror
        // CustomerSshKeyConfiguration.cs).
        builder.HasOne(x => x.Customer)
            .WithMany(x => x.Notifications)
            .HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
