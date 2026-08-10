using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Content;

public class FaqConfiguration : IEntityTypeConfiguration<Faq>
{
    public void Configure(EntityTypeBuilder<Faq> builder)
    {
        builder.ToTable("Faqs");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Question).HasMaxLength(500).IsRequired();
        builder.Property(x => x.Answer).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(x => new { x.ServiceCategoryId, x.IsActive, x.DisplayOrder });

        builder.HasOne(x => x.ServiceCategory)
            .WithMany()
            .HasForeignKey(x => x.ServiceCategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasQueryFilter(x => !x.IsDeleted);

        // Dữ liệu mẫu — gắn với ServiceCategory Id=1 (VPS) đã seed ở Phase 2.
        builder.HasData(new Faq
        {
            Id = 1,
            Question = "VPS SSD khác gì Hosting thông thường?",
            Answer = "VPS SSD cấp cho bạn tài nguyên riêng (CPU/RAM/SSD) và quyền quản trị toàn bộ máy chủ ảo, trong khi Hosting dùng chung tài nguyên với nhiều khách hàng khác.",
            ServiceCategoryId = 1,
            DisplayOrder = 1,
            IsActive = true,
            IsDeleted = false,
            CreatedAt = new DateTime(2026, 8, 10, 0, 0, 0, DateTimeKind.Utc)
        });
    }
}
