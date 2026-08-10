using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Content;

public class NewsArticleTagConfiguration : IEntityTypeConfiguration<NewsArticleTag>
{
    public void Configure(EntityTypeBuilder<NewsArticleTag> builder)
    {
        builder.ToTable("NewsArticleTags");
        builder.HasKey(x => new { x.NewsArticleId, x.TagId });

        builder.HasOne(x => x.NewsArticle)
            .WithMany(x => x.ArticleTags)
            .HasForeignKey(x => x.NewsArticleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Tag)
            .WithMany(x => x.ArticleTags)
            .HasForeignKey(x => x.TagId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
