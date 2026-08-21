using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Features.Sales.OrderRequests;
using CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;

namespace CloudServiceStore.Tests.Features.Sales.OrderRequests;

public class OrderRequestServiceTests
{
    // Id/slug cố ý khác dữ liệu HasData (ServicePlan Id 1-2, PlanPrice Id 1-4) đã seed sẵn trong model
    // để test không phụ thuộc vào việc InMemory provider có tự nạp seed data hay không.
    private static async Task<ServicePlan> SeedPlanWithPricesAsync(AppDbContext context)
    {
        var category = new ServiceCategory { Id = 501, Name = "Test Category", Slug = "test-category-orq", DisplayOrder = 1, IsActive = true };
        var plan = new ServicePlan { Id = 501, CategoryId = category.Id, Category = category, Name = "Test Plan", Slug = "test-plan-orq", IsActive = true };

        context.ServiceCategories.Add(category);
        context.ServicePlans.Add(plan);
        context.PlanPrices.AddRange(
            new PlanPrice { Id = 501, PlanId = plan.Id, PeriodMonths = 1, Price = 100000m, PromotionalPrice = null, IsDefault = true, IsActive = true },
            new PlanPrice { Id = 502, PlanId = plan.Id, PeriodMonths = 12, Price = 1000000m, PromotionalPrice = 900000m, IsDefault = false, IsActive = true }
        );
        await context.SaveChangesAsync();
        return plan;
    }

    private static CreateOrderRequestDto BuildDto(int? servicePlanId, int? periodMonths, int quantity) => new()
    {
        CustomerType = CustomerType.Individual,
        CustomerName = "Test Customer",
        CustomerEmail = "test@example.com",
        CustomerPhone = "0900000000",
        ServicePlanId = servicePlanId,
        PeriodMonths = periodMonths,
        Quantity = quantity
    };

    [Fact]
    public async Task CreateAsync_PlanNotFound_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));

        await Assert.ThrowsAsync<NotFoundException>(() => sut.CreateAsync(BuildDto(servicePlanId: 9999, periodMonths: null, quantity: 1)));
    }

    [Fact]
    public async Task CreateAsync_PeriodMonthsSpecified_UsesMatchingPlanPrice()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));

        var result = await sut.CreateAsync(BuildDto(plan.Id, periodMonths: 1, quantity: 2));

        Assert.Equal(200000m, result.TotalPrice);
    }

    [Fact]
    public async Task CreateAsync_NoPeriodSpecified_UsesDefaultPlanPrice()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));

        var result = await sut.CreateAsync(BuildDto(plan.Id, periodMonths: null, quantity: 1));

        Assert.Equal(100000m, result.TotalPrice);
    }

    [Fact]
    public async Task CreateAsync_PromotionalPriceSet_UsesPromotionalPriceTimesQuantity()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));

        var result = await sut.CreateAsync(BuildDto(plan.Id, periodMonths: 12, quantity: 3));

        Assert.Equal(2700000m, result.TotalPrice);
    }
}
