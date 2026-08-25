using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Admin.Catalog.ServicePlans;
using CloudServiceStore.Application.Features.Admin.Catalog.ServicePlans.Dtos;
using CloudServiceStore.Application.Features.Catalog.ServicePlans.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;
using Moq;

namespace CloudServiceStore.Tests.Features.Admin.Catalog.ServicePlans;

public class AdminServicePlanServiceTests
{
    // Id cố ý khác dữ liệu HasData (ServiceCategory 1-6, ServicePlan 1-2) đã seed sẵn trong model.
    private static async Task<ServiceCategory> SeedCategoryAsync(AppDbContext context)
    {
        var category = new ServiceCategory { Id = 601, Name = "Test Category", Slug = "test-category-asp", DisplayOrder = 1, IsActive = true };
        context.ServiceCategories.Add(category);
        await context.SaveChangesAsync();
        return category;
    }

    private static AdminServicePlanService CreateSut(AppDbContext context)
    {
        // Factory Method (Phase 2.4) — không cần verify hành vi sinh QR ở đây, chỉ cần 1 instance hợp lệ.
        return new AdminServicePlanService(TestDbContextFactory.CreateUnitOfWork(context), new Mock<IQrCodeFactory>().Object);
    }

    [Fact]
    public async Task GetListAsync_ReturnsAllPlans_IncludingInactive()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        context.ServicePlans.AddRange(
            new ServicePlan { Id = 601, CategoryId = category.Id, Name = "Active Plan", Slug = "active-plan", Status = ServicePlanStatus.Active },
            new ServicePlan { Id = 602, CategoryId = category.Id, Name = "Archived Plan", Slug = "archived-plan", Status = ServicePlanStatus.Archived });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetListAsync(new ServicePlanQueryParams());

        Assert.Equal(2, result.TotalCount);
        Assert.Contains(result.Items, p => p.Slug == "archived-plan");
    }

    [Fact]
    public async Task GetListAsync_FilterByStatus_ReturnsOnlyMatchingStatus()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        context.ServicePlans.AddRange(
            new ServicePlan { Id = 611, CategoryId = category.Id, Name = "Draft Plan", Slug = "draft-plan", Status = ServicePlanStatus.Draft },
            new ServicePlan { Id = 612, CategoryId = category.Id, Name = "Active Plan 2", Slug = "active-plan-2", Status = ServicePlanStatus.Active });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetListAsync(new ServicePlanQueryParams { Status = ServicePlanStatus.Draft });

        Assert.Single(result.Items);
        Assert.Equal("draft-plan", result.Items[0].Slug);
    }

    [Fact]
    public async Task CreateAsync_DuplicateSku_ThrowsConflictException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        context.ServicePlans.Add(new ServicePlan { Id = 621, CategoryId = category.Id, Name = "Existing", Slug = "existing-plan", Sku = "VPS-DUP" });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var dto = new CreateServicePlanDto
        {
            CategoryId = category.Id,
            Name = "New Plan",
            Slug = "new-plan-sku",
            Sku = "VPS-DUP",
        };

        await Assert.ThrowsAsync<ConflictException>(() => sut.CreateAsync(dto));
    }

    [Fact]
    public async Task GetByIdAsync_NotFound_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<NotFoundException>(() => sut.GetByIdAsync(9999));
    }

    [Fact]
    public async Task GetByIdAsync_Found_ReturnsPlanWithFeaturesAndPrices()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        var plan = new ServicePlan { Id = 603, CategoryId = category.Id, Name = "Test Plan", Slug = "test-plan-asp", Status = ServicePlanStatus.Active };
        context.ServicePlans.Add(plan);
        context.PlanFeatures.Add(new PlanFeature { PlanId = plan.Id, FeatureKey = "cpu", FeatureLabel = "CPU", FeatureValueText = "2 vCPU" });
        context.PlanPrices.Add(new PlanPrice { PlanId = plan.Id, PeriodMonths = 1, Price = 100000m, IsDefault = true, IsActive = true });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetByIdAsync(plan.Id);

        Assert.Equal("test-plan-asp", result.Slug);
        Assert.Single(result.Features);
        Assert.Single(result.Prices);
    }
}
