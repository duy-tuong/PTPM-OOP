using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Features.Content.NewsArticles;
using CloudServiceStore.Application.Features.Content.NewsArticles.Dtos;
using CloudServiceStore.Domain.Entities.Content;
using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;

namespace CloudServiceStore.Tests.Features.Content.NewsArticles;

public class NewsArticleServiceTests
{
    // Id cố ý khác dữ liệu HasData (NewsArticle Id=1) và các seed khác trong file, mirror quy ước chung.
    private static async Task<(NewsCategory Category, AppUser Author)> SeedBaseAsync(AppDbContext context)
    {
        var category = new NewsCategory { Id = 621, Name = "Test News Category", Slug = "test-news-category-pub", DisplayOrder = 1, IsActive = true };
        var author = new AppUser
        {
            Id = Guid.NewGuid(),
            Username = "news-author-pub",
            Email = "news-author-pub@cloudverse.local",
            PasswordHash = "hash",
            FullName = "Nguyễn Văn Tác Giả",
        };
        context.NewsCategories.Add(category);
        context.AppUsers.Add(author);
        await context.SaveChangesAsync();
        return (category, author);
    }

    private static NewsArticle BuildArticle(
        int id, int categoryId, Guid authorId, string title, string slug,
        DateTime? publishedAt = null, bool isPublished = true, bool isFeatured = false,
        int viewCount = 0, string content = "Nội dung bài viết mẫu.") => new()
    {
        Id = id,
        AuthorId = authorId,
        NewsCategoryId = categoryId,
        Title = title,
        Slug = slug,
        Content = content,
        ViewCount = viewCount,
        IsFeatured = isFeatured,
        IsPublished = isPublished,
        PublishedAt = publishedAt ?? DateTime.UtcNow,
    };

    private static NewsArticleService CreateSut(AppDbContext context) =>
        new(TestDbContextFactory.CreateUnitOfWork(context));

    [Fact]
    public async Task GetListAsync_NoSortParam_OrdersByPublishedAtDescending()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (category, author) = await SeedBaseAsync(context);
        context.NewsArticles.AddRange(
            BuildArticle(621, category.Id, author.Id, "Old", "old-article-pub", DateTime.UtcNow.AddDays(-5)),
            BuildArticle(622, category.Id, author.Id, "New", "new-article-pub", DateTime.UtcNow.AddDays(-1)));
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetListAsync(new NewsArticleQueryParams());

        Assert.Equal("new-article-pub", result.Items[0].Slug);
        Assert.Equal("old-article-pub", result.Items[1].Slug);
    }

    [Fact]
    public async Task GetListAsync_SortOldest_OrdersByPublishedAtAscending()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (category, author) = await SeedBaseAsync(context);
        context.NewsArticles.AddRange(
            BuildArticle(623, category.Id, author.Id, "Old", "old-article-sort", DateTime.UtcNow.AddDays(-5)),
            BuildArticle(624, category.Id, author.Id, "New", "new-article-sort", DateTime.UtcNow.AddDays(-1)));
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetListAsync(new NewsArticleQueryParams { Sort = "oldest" });

        Assert.Equal("old-article-sort", result.Items[0].Slug);
        Assert.Equal("new-article-sort", result.Items[1].Slug);
    }

    [Fact]
    public async Task GetListAsync_SortPopular_OrdersByViewCountDescending()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (category, author) = await SeedBaseAsync(context);
        context.NewsArticles.AddRange(
            BuildArticle(625, category.Id, author.Id, "Low views", "low-views-article", viewCount: 10),
            BuildArticle(626, category.Id, author.Id, "High views", "high-views-article", viewCount: 999));
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetListAsync(new NewsArticleQueryParams { Sort = "popular" });

        Assert.Equal("high-views-article", result.Items[0].Slug);
        Assert.Equal("low-views-article", result.Items[1].Slug);
    }

    [Fact]
    public async Task GetListAsync_FeaturedTrue_ReturnsOnlyFeaturedArticles()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (category, author) = await SeedBaseAsync(context);
        context.NewsArticles.AddRange(
            BuildArticle(627, category.Id, author.Id, "Featured", "featured-article", isFeatured: true),
            BuildArticle(628, category.Id, author.Id, "Regular", "regular-article", isFeatured: false));
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetListAsync(new NewsArticleQueryParams { Featured = true });

        Assert.Single(result.Items);
        Assert.Equal("featured-article", result.Items[0].Slug);
    }

    [Fact]
    public async Task GetListAsync_SearchMatchesTagName_ReturnsArticle()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (category, author) = await SeedBaseAsync(context);
        var article = BuildArticle(629, category.Id, author.Id, "Chống tấn công mạng", "chong-tan-cong-mang");
        article.ArticleTags.Add(new NewsArticleTag { Tag = new NewsTag { Name = "DDoS", Slug = "ddos-search-tag" } });
        context.NewsArticles.Add(article);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetListAsync(new NewsArticleQueryParams { Search = "DDoS" });

        Assert.Single(result.Items);
        Assert.Equal("chong-tan-cong-mang", result.Items[0].Slug);
    }

    [Fact]
    public async Task GetBySlugAsync_DoesNotIncrementViewCount()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (category, author) = await SeedBaseAsync(context);
        var article = BuildArticle(630, category.Id, author.Id, "Bài viết", "bai-viet-no-increment", viewCount: 5);
        context.NewsArticles.Add(article);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetBySlugAsync(article.Slug);

        Assert.Equal(5, result.ViewCount);
        var reloaded = await context.NewsArticles.FindAsync(article.Id);
        Assert.Equal(5, reloaded!.ViewCount);
    }

    [Fact]
    public async Task GetBySlugAsync_MapsAuthorNameIsFeaturedAndWordCount()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (category, author) = await SeedBaseAsync(context);
        var article = BuildArticle(631, category.Id, author.Id, "Bài viết", "bai-viet-mapping", isFeatured: true, content: "Một hai ba bốn năm");
        context.NewsArticles.Add(article);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetBySlugAsync(article.Slug);

        Assert.Equal(author.FullName, result.AuthorName);
        Assert.True(result.IsFeatured);
        Assert.Equal(5, result.WordCount);
    }

    [Fact]
    public async Task IncrementViewCountAsync_ExistingPublishedSlug_IncrementsByOne()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (category, author) = await SeedBaseAsync(context);
        var article = BuildArticle(632, category.Id, author.Id, "Bài viết", "bai-viet-increment", viewCount: 5);
        context.NewsArticles.Add(article);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        await sut.IncrementViewCountAsync(article.Slug);

        var reloaded = await context.NewsArticles.FindAsync(article.Id);
        Assert.Equal(6, reloaded!.ViewCount);
    }

    [Fact]
    public async Task IncrementViewCountAsync_UnknownSlug_NoOpDoesNotThrow()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        await sut.IncrementViewCountAsync("khong-ton-tai-increment");
        // Không throw là đủ - tracking phụ, không được làm hỏng trải nghiệm.
    }

    [Fact]
    public async Task GetRelatedAsync_PrioritizesMoreSharedTagsOverCategoryOnly()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (categoryA, author) = await SeedBaseAsync(context);
        var categoryB = new NewsCategory { Id = 622, Name = "Category B", Slug = "test-news-category-b", DisplayOrder = 2, IsActive = true };
        context.NewsCategories.Add(categoryB);

        var tagVps = new NewsTag { Name = "VPS", Slug = "vps-related-tag" };
        var tagCloud = new NewsTag { Name = "Cloud", Slug = "cloud-related-tag" };
        var tagSsd = new NewsTag { Name = "SSD", Slug = "ssd-related-tag" };

        var current = BuildArticle(633, categoryA.Id, author.Id, "Bài gốc", "bai-goc-related");
        current.ArticleTags.Add(new NewsArticleTag { Tag = tagVps });
        current.ArticleTags.Add(new NewsArticleTag { Tag = tagCloud });
        current.ArticleTags.Add(new NewsArticleTag { Tag = tagSsd });

        // Cùng category, không chung tag nào - score = 2.
        var sameCategoryOnly = BuildArticle(634, categoryA.Id, author.Id, "Cùng danh mục", "cung-danh-muc-related");

        // Khác category, chung cả 3 tag - score = 0 + 3 = 3, phải xếp trước sameCategoryOnly.
        var manySharedTags = BuildArticle(635, categoryB.Id, author.Id, "Chung nhiều tag", "chung-nhieu-tag-related");
        manySharedTags.ArticleTags.Add(new NewsArticleTag { Tag = tagVps });
        manySharedTags.ArticleTags.Add(new NewsArticleTag { Tag = tagCloud });
        manySharedTags.ArticleTags.Add(new NewsArticleTag { Tag = tagSsd });

        context.NewsArticles.AddRange(current, sameCategoryOnly, manySharedTags);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetRelatedAsync(current.Slug, take: 3);

        Assert.Equal(2, result.Count);
        Assert.Equal("chung-nhieu-tag-related", result[0].Slug);
        Assert.Equal("cung-danh-muc-related", result[1].Slug);
    }

    [Fact]
    public async Task GetRelatedAsync_ExcludesUnrelatedArticles()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (categoryA, author) = await SeedBaseAsync(context);
        var categoryB = new NewsCategory { Id = 623, Name = "Category B", Slug = "test-news-category-b2", DisplayOrder = 2, IsActive = true };
        context.NewsCategories.Add(categoryB);

        var current = BuildArticle(636, categoryA.Id, author.Id, "Bài gốc", "bai-goc-unrelated");
        var unrelated = BuildArticle(637, categoryB.Id, author.Id, "Không liên quan", "khong-lien-quan-unrelated");
        context.NewsArticles.AddRange(current, unrelated);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetRelatedAsync(current.Slug, take: 3);

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetRelatedAsync_UnknownSlug_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<NotFoundException>(() => sut.GetRelatedAsync("khong-ton-tai-related-2"));
    }
}
