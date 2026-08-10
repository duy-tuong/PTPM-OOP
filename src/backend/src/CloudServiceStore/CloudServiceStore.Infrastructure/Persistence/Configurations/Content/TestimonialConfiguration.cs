using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Content;

public class TestimonialConfiguration : IEntityTypeConfiguration<Testimonial>
{
    public void Configure(EntityTypeBuilder<Testimonial> builder)
    {
        builder.ToTable("Testimonials");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.DisplayName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.CompanyName).HasMaxLength(150);
        builder.Property(x => x.AvatarUrl).HasMaxLength(500);
        builder.Property(x => x.Content).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(x => new { x.IsActive, x.DisplayOrder });

        builder.HasOne(x => x.Customer)
            .WithMany()
            .HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasQueryFilter(x => !x.IsDeleted);

        // Dữ liệu mẫu.
        builder.HasData(new Testimonial
        {
            Id = 1,
            CustomerId = null,
            DisplayName = "Nguyễn Văn A",
            CompanyName = "Công ty TNHH ABC",
            Content = "Dịch vụ VPS ổn định, hỗ trợ kỹ thuật nhanh chóng. Rất hài lòng!",
            Rating = 5,
            DisplayOrder = 1,
            IsActive = true,
            IsDeleted = false,
            CreatedAt = new DateTime(2026, 8, 10, 0, 0, 0, DateTimeKind.Utc)
        });
    }
}
