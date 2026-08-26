using CloudServiceStore.Domain.Entities.Marketing;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Marketing;

public class PromotionConfiguration : IEntityTypeConfiguration<Promotion>
{
    public void Configure(EntityTypeBuilder<Promotion> builder)
    {
        builder.ToTable("Promotions");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.Property(x => x.DiscountType).HasConversion<int>();
        builder.Property(x => x.CustomerEligibility).HasConversion<int>().HasDefaultValue(PromotionCustomerEligibility.All);
        builder.Property(x => x.DiscountValue).HasColumnType("decimal(18,2)");
        builder.Property(x => x.MaxDiscountAmount).HasColumnType("decimal(18,2)");
        builder.Property(x => x.MinOrderValue).HasColumnType("decimal(18,2)");
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(x => x.Code).IsUnique();
        builder.HasIndex(x => new { x.IsActive, x.StartDate, x.EndDate });

        builder.HasQueryFilter(x => !x.IsDeleted);

        // Dữ liệu mẫu — 1 khuyến mãi đang hiệu lực (khoảng ngày rộng để không tự hết hạn lúc demo).
        builder.HasData(new Promotion
        {
            Id = 1,
            Code = "WELCOME2026",
            Name = "Ưu đãi chào năm mới 2026",
            Description = "Giảm giá cho khách hàng đăng ký mới trong năm 2026.",
            DiscountType = DiscountType.Percentage,
            DiscountValue = 10m,
            MaxDiscountAmount = 500000m,
            MinOrderValue = null,
            StartDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            EndDate = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
            UsageLimit = null,
            UsageCount = 0,
            IsActive = true,
            CustomerEligibility = PromotionCustomerEligibility.All,
            IsDeleted = false,
            CreatedAt = new DateTime(2026, 8, 10, 0, 0, 0, DateTimeKind.Utc)
        });
    }
}
