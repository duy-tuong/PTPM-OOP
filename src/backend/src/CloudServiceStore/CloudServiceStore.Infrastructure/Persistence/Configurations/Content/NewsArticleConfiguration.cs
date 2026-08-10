using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Content;

public class NewsArticleConfiguration : IEntityTypeConfiguration<NewsArticle>
{
    public void Configure(EntityTypeBuilder<NewsArticle> builder)
    {
        builder.ToTable("NewsArticles");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title).HasMaxLength(250).IsRequired();
        builder.Property(x => x.Slug).HasMaxLength(270).IsRequired();
        builder.Property(x => x.Summary).HasMaxLength(500);
        builder.Property(x => x.ThumbnailUrl).HasMaxLength(500);
        builder.Property(x => x.PublishedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(x => x.Slug).IsUnique();
        builder.HasIndex(x => new { x.IsPublished, x.PublishedAt });
        builder.HasIndex(x => new { x.NewsCategoryId, x.IsPublished });

        builder.HasOne(x => x.Author)
            .WithMany()
            .HasForeignKey(x => x.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.NewsCategory)
            .WithMany(x => x.Articles)
            .HasForeignKey(x => x.NewsCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(x => !x.IsDeleted);

        // Dữ liệu mẫu — AuthorId dùng đúng GUID Admin đã seed ở Phase 2 (AppUserConfiguration).
        builder.HasData(new NewsArticle
        {
            Id = 1,
            AuthorId = Guid.Parse("00000000-0000-0000-0000-000000000001"),
            NewsCategoryId = 1,
            Title = "Ra mắt chương trình ưu đãi VPS đầu năm 2026",
            Slug = "ra-mat-uu-dai-vps-dau-nam-2026",
            Summary = "Giảm giá đến 10% cho các gói VPS SSD trong tháng 1/2026.",
            Content = "Nhân dịp đầu năm 2026, CloudServiceStore triển khai chương trình ưu đãi giảm giá lên đến 10% cho toàn bộ gói VPS SSD. Chương trình áp dụng cho khách hàng đăng ký mới trong suốt năm 2026.",
            ViewCount = 0,
            IsPublished = true,
            PublishedAt = new DateTime(2026, 8, 10, 0, 0, 0, DateTimeKind.Utc),
            IsDeleted = false,
            CreatedAt = new DateTime(2026, 8, 10, 0, 0, 0, DateTimeKind.Utc)
        });
    }
}
