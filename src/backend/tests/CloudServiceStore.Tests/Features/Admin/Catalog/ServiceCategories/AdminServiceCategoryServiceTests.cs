using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Features.Admin.Catalog.ServiceCategories;
using CloudServiceStore.Application.Features.Admin.Catalog.ServiceCategories.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;

namespace CloudServiceStore.Tests.Features.Admin.Catalog.ServiceCategories;

public class AdminServiceCategoryServiceTests
{
    // Id/slug cố ý khác dữ liệu HasData (1-6, slug vps/hosting/domain/...) đã seed sẵn trong model
    // để test không phụ thuộc vào việc InMemory provider có tự nạp seed data hay không.
    private static async Task<ServiceCategory> SeedCategoryAsync(AppDbContext context, string slug = "test-category")
    {
        var category = new ServiceCategory
        {
            Id = 501,
            Name = "Test Category",
            Slug = slug,
            DisplayOrder = 1,
            IsActive = true
        };
        context.ServiceCategories.Add(category);
        await context.SaveChangesAsync();
        return category;
    }

    [Fact]
    public async Task CreateAsync_DuplicateSlug_ThrowsConflictException()
    {
        using var context = TestDbContextFactory.CreateContext();
        await SeedCategoryAsync(context, "test-category");
        var sut = new AdminServiceCategoryService(TestDbContextFactory.CreateUnitOfWork(context));

        var dto = new CreateServiceCategoryDto { Name = "Another Category", Slug = "test-category", DisplayOrder = 2, IsActive = true };

        await Assert.ThrowsAsync<ConflictException>(() => sut.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_UniqueSlug_PersistsCategory()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = new AdminServiceCategoryService(TestDbContextFactory.CreateUnitOfWork(context));

        var dto = new CreateServiceCategoryDto { Name = "CDN", Slug = "cdn", DisplayOrder = 1, IsActive = true };

        var result = await sut.CreateAsync(dto);

        Assert.Equal("cdn", result.Slug);
        Assert.Single(context.ServiceCategories, c => c.Slug == "cdn");
    }

    [Fact]
    public async Task UpdateAsync_ExcludesOwnIdFromSlugUniquenessCheck()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context, "test-category");
        var sut = new AdminServiceCategoryService(TestDbContextFactory.CreateUnitOfWork(context));

        var dto = new UpdateServiceCategoryDto { Name = "Test Category Updated", Slug = "test-category", DisplayOrder = 1, IsActive = true };

        var result = await sut.UpdateAsync(category.Id, dto);

        Assert.Equal("Test Category Updated", result.Name);
    }

    [Fact]
    public async Task UpdateAsync_NotFound_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = new AdminServiceCategoryService(TestDbContextFactory.CreateUnitOfWork(context));

        var dto = new UpdateServiceCategoryDto { Name = "X", Slug = "x", DisplayOrder = 1, IsActive = true };

        await Assert.ThrowsAsync<NotFoundException>(() => sut.UpdateAsync(9999, dto));
    }
}
