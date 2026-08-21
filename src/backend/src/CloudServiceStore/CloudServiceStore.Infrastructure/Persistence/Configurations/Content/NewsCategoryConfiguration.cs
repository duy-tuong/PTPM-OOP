using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Content;

public class NewsCategoryConfiguration : IEntityTypeConfiguration<NewsCategory>
{
    public void Configure(EntityTypeBuilder<NewsCategory> builder)
    {
        builder.ToTable("NewsCategories");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Slug).HasMaxLength(120).IsRequired();

        builder.HasIndex(x => x.Slug).IsUnique();

        builder.HasQueryFilter(x => !x.IsDeleted);

        // Dữ liệu mẫu.
        builder.HasData(new NewsCategory
        {
            Id = 1,
            Name = "Khuyến mãi",
            Slug = "khuyen-mai",
            Description = "Tin tức khuyến mãi, ưu đãi mới nhất.",
            DisplayOrder = 1,
            IsActive = true,
            IsDeleted = false
        });
    }
}
