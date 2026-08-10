using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Content;

public class ContentPageConfiguration : IEntityTypeConfiguration<ContentPage>
{
    public void Configure(EntityTypeBuilder<ContentPage> builder)
    {
        builder.ToTable("ContentPages");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Slug).HasMaxLength(150).IsRequired();
        builder.Property(x => x.Title).HasMaxLength(250).IsRequired();
        builder.Property(x => x.MetaTitle).HasMaxLength(200);
        builder.Property(x => x.MetaDescription).HasMaxLength(500);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(x => x.Slug).IsUnique();
        builder.HasIndex(x => x.IsPublished);

        builder.HasOne(x => x.Author)
            .WithMany()
            .HasForeignKey(x => x.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(x => !x.IsDeleted);

        // Dữ liệu mẫu — trang "Giới thiệu" theo đúng mục 3.1.2 đề bài, AuthorId dùng GUID Admin seed ở Phase 2.
        builder.HasData(new ContentPage
        {
            Id = 1,
            Slug = "gioi-thieu",
            Title = "Giới thiệu về CloudServiceStore",
            Content = "CloudServiceStore là đơn vị cung cấp hạ tầng cloud (VPS, Hosting, Domain, Email doanh nghiệp, SSL, Firewall chống DDoS) với cam kết uptime 99.9%.",
            MetaTitle = "Giới thiệu - CloudServiceStore",
            MetaDescription = "Tìm hiểu về lịch sử, hạ tầng và cam kết SLA của CloudServiceStore.",
            AuthorId = Guid.Parse("00000000-0000-0000-0000-000000000001"),
            IsPublished = true,
            PublishedAt = new DateTime(2026, 8, 10, 0, 0, 0, DateTimeKind.Utc),
            DisplayOrder = 1,
            IsDeleted = false,
            CreatedAt = new DateTime(2026, 8, 10, 0, 0, 0, DateTimeKind.Utc)
        });
    }
}
