using CloudServiceStore.Application.Features.Content.NewsTags;
using CloudServiceStore.Domain.Entities.Content;
using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;

namespace CloudServiceStore.Tests.Features.Content.NewsTags;

public class NewsTagServiceTests
{
    // Id cố ý khác dữ liệu HasData và các seed khác trong file, mirror quy ước chung.
    private static async Task<(NewsCategory Category, AppUser Author)> SeedBaseAsync(AppDbContext context)
    {
        var category = new NewsCategory { Id = 641, Name = "Test News Category", Slug = "test-news-category-tag", DisplayOrder = 1, IsActive = true };
        var author = new AppUser
        {
            Id = Guid.NewGuid(),
            Username = "news-author-tag",
            Email = "news-author-tag@cloudverse.local",
            PasswordHash = "hash",
            FullName = "Tác Giả Tag",
        };
        context.NewsCategories.Add(category);
        context.AppUsers.Add(author);
        await context.SaveChangesAsync();
        return (category, author);
    }

    private static NewsArticle BuildArticle(int id, int categoryId, Guid authorId, string slug, bool isPublished = true) => new()
    {
        Id = id,
        AuthorId = authorId,
        NewsCategoryId = categoryId,
        Title = "Bài viết",
        Slug = slug,
        Content = "Nội dung.",
        IsPublished = isPublished,
        PublishedAt = DateTime.UtcNow.AddDays(-1),
    };

    private static NewsTagService CreateSut(AppDbContext context) =>
        new(TestDbContextFactory.CreateUnitOfWork(context));

    [Fact]
    public async Task GetListAsync_ExcludesTagsWithNoPublishedArticles()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (category, author) = await SeedBaseAsync(context);
        var popularTag = new NewsTag { Name = "Popular", Slug = "popular-tag-t1" };
        var orphanTag = new NewsTag { Name = "Orphan", Slug = "orphan-tag-t1" };

        var article = BuildArticle(641, category.Id, author.Id, "article-with-popular-tag");
        article.ArticleTags.Add(new NewsArticleTag { Tag = popularTag });

        var unpublished = BuildArticle(642, category.Id, author.Id, "unpublished-with-orphan-tag", isPublished: false);
        unpublished.ArticleTags.Add(new NewsArticleTag { Tag = orphanTag });

        context.NewsArticles.AddRange(article, unpublished);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetListAsync(take: 20);

        Assert.Contains(result, t => t.Slug == "popular-tag-t1");
        Assert.DoesNotContain(result, t => t.Slug == "orphan-tag-t1");
    }

    [Fact]
    public async Task GetListAsync_OrdersByArticleCountDescending()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (category, author) = await SeedBaseAsync(context);
        var tagA = new NewsTag { Name = "TagA", Slug = "tag-a-t2" };
        var tagB = new NewsTag { Name = "TagB", Slug = "tag-b-t2" };

        var article1 = BuildArticle(643, category.Id, author.Id, "article-1-t2");
        article1.ArticleTags.Add(new NewsArticleTag { Tag = tagA });
        var article2 = BuildArticle(644, category.Id, author.Id, "article-2-t2");
        article2.ArticleTags.Add(new NewsArticleTag { Tag = tagA });
        var article3 = BuildArticle(645, category.Id, author.Id, "article-3-t2");
        article3.ArticleTags.Add(new NewsArticleTag { Tag = tagB });

        context.NewsArticles.AddRange(article1, article2, article3);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetListAsync(take: 20);

        Assert.Equal("tag-a-t2", result[0].Slug);
        Assert.Equal(2, result[0].ArticleCount);
        Assert.Equal("tag-b-t2", result[1].Slug);
        Assert.Equal(1, result[1].ArticleCount);
    }

    [Fact]
    public async Task GetListAsync_RespectsTakeLimit()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (category, author) = await SeedBaseAsync(context);
        for (var i = 0; i < 3; i++)
        {
            var tag = new NewsTag { Name = $"Tag{i}", Slug = $"tag-take-{i}" };
            var article = BuildArticle(646 + i, category.Id, author.Id, $"article-take-{i}");
            article.ArticleTags.Add(new NewsArticleTag { Tag = tag });
            context.NewsArticles.Add(article);
        }
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetListAsync(take: 2);

        Assert.Equal(2, result.Count);
    }
}
