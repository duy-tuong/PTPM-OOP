using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Features.Admin.Content.NewsArticles;
using CloudServiceStore.Application.Features.Content.NewsArticles.Dtos;
using CloudServiceStore.Domain.Entities.Content;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;

namespace CloudServiceStore.Tests.Features.Admin.Content.NewsArticles;

public class AdminNewsArticleServiceTests
{
    // Id cố ý khác dữ liệu HasData đã seed sẵn trong model.
    private static async Task<NewsCategory> SeedCategoryAsync(AppDbContext context)
    {
        var category = new NewsCategory { Id = 601, Name = "Test News Category", Slug = "test-news-category-ana", DisplayOrder = 1, IsActive = true };
        context.NewsCategories.Add(category);
        await context.SaveChangesAsync();
        return category;
    }

    private static AdminNewsArticleService CreateSut(AppDbContext context) =>
        new(TestDbContextFactory.CreateUnitOfWork(context));

    [Fact]
    public async Task GetListAsync_ReturnsAllArticles_IncludingUnpublished()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        context.NewsArticles.AddRange(
            new NewsArticle { Id = 601, AuthorId = Guid.NewGuid(), NewsCategoryId = category.Id, Title = "Published", Slug = "published-article", Content = "...", IsPublished = true },
            new NewsArticle { Id = 602, AuthorId = Guid.NewGuid(), NewsCategoryId = category.Id, Title = "Draft", Slug = "draft-article", Content = "...", IsPublished = false });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetListAsync(new NewsArticleQueryParams());

        Assert.Equal(2, result.TotalCount);
        Assert.Contains(result.Items, a => a.Slug == "draft-article");
    }

    [Fact]
    public async Task GetByIdAsync_NotFound_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<NotFoundException>(() => sut.GetByIdAsync(9999));
    }

    [Fact]
    public async Task GetByIdAsync_Found_ReturnsArticleWithTags()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        var article = new NewsArticle { Id = 603, AuthorId = Guid.NewGuid(), NewsCategoryId = category.Id, Title = "Test Article", Slug = "test-article-ana", Content = "...", IsPublished = false };
        var tag = new NewsTag { Name = "Khuyến mãi", Slug = "khuyen-mai-ana" };
        article.ArticleTags.Add(new NewsArticleTag { Tag = tag });
        context.NewsArticles.Add(article);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetByIdAsync(article.Id);

        Assert.Equal("test-article-ana", result.Slug);
        Assert.Equal(["Khuyến mãi"], result.Tags);
    }
}
