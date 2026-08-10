using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Content;

public class NewsCommentConfiguration : IEntityTypeConfiguration<NewsComment>
{
    public void Configure(EntityTypeBuilder<NewsComment> builder)
    {
        builder.ToTable("NewsComments");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.AuthorName).HasMaxLength(100);
        builder.Property(x => x.AuthorEmail).HasMaxLength(200);
        builder.Property(x => x.Content).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(x => new { x.NewsArticleId, x.IsApproved, x.CreatedAt });

        builder.HasOne(x => x.NewsArticle)
            .WithMany(x => x.Comments)
            .HasForeignKey(x => x.NewsArticleId)
            .OnDelete(DeleteBehavior.Cascade);

        // Restrict: FK tự tham chiếu (self-referencing), SQL Server không cho phép Cascade ở đây.
        builder.HasOne(x => x.ParentComment)
            .WithMany(x => x.Replies)
            .HasForeignKey(x => x.ParentCommentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Customer)
            .WithMany()
            .HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
