using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Features.Sales.OrderRequests;
using CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Marketing;
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

    private static async Task<Promotion> SeedPromotionAsync(
        AppDbContext context,
        DiscountType discountType,
        decimal discountValue,
        decimal? maxDiscountAmount = null,
        decimal? minOrderValue = null,
        int? usageLimit = null,
        int usageCount = 0,
        bool isActive = true,
        DateTime? startDate = null,
        DateTime? endDate = null,
        ScopeType scopeType = ScopeType.All,
        int? scopedPlanId = null,
        int? scopedCategoryId = null)
    {
        var promotion = new Promotion
        {
            Code = "TEST10",
            Name = "Test Promotion",
            DiscountType = discountType,
            DiscountValue = discountValue,
            MaxDiscountAmount = maxDiscountAmount,
            MinOrderValue = minOrderValue,
            UsageLimit = usageLimit,
            UsageCount = usageCount,
            IsActive = isActive,
            StartDate = startDate ?? DateTime.UtcNow.AddDays(-1),
            EndDate = endDate ?? DateTime.UtcNow.AddDays(1),
        };
        promotion.Scopes.Add(new PromotionScope
        {
            ScopeType = scopeType,
            ServicePlanId = scopeType == ScopeType.Plan ? scopedPlanId : null,
            ServiceCategoryId = scopeType == ScopeType.Category ? scopedCategoryId : null,
        });

        context.Promotions.Add(promotion);
        await context.SaveChangesAsync();
        return promotion;
    }

    private static async Task<TldPricing> SeedTldPricingAsync(AppDbContext context, bool isActive = true, int? categoryId = null)
    {
        var tldPricing = new TldPricing
        {
            Tld = ".com",
            ServiceCategoryId = categoryId,
            RegisterPrice = 250000m,
            RenewPrice = 300000m,
            TransferPrice = 250000m,
            IsActive = isActive,
        };
        context.TldPricings.Add(tldPricing);
        await context.SaveChangesAsync();
        return tldPricing;
    }

    private static CreateOrderRequestDto BuildDomainDto(int tldPricingId, string domainName, int quantity) => new()
    {
        CustomerType = CustomerType.Individual,
        CustomerName = "Test Customer",
        CustomerEmail = "test@example.com",
        CustomerPhone = "0900000000",
        TldPricingId = tldPricingId,
        DomainName = domainName,
        Quantity = quantity
    };

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

    [Fact]
    public async Task CreateAsync_CustomerIdProvided_LinksOrderToCustomer()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));
        var customerId = Guid.NewGuid();

        var result = await sut.CreateAsync(BuildDto(plan.Id, periodMonths: null, quantity: 1), customerId);

        var saved = context.OrderRequests.Single(o => o.Id == result.Id);
        Assert.Equal(customerId, saved.CustomerId);
    }

    [Fact]
    public async Task CreateAsync_NoCustomerId_LeavesCustomerIdNull()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));

        var result = await sut.CreateAsync(BuildDto(plan.Id, periodMonths: null, quantity: 1));

        var saved = context.OrderRequests.Single(o => o.Id == result.Id);
        Assert.Null(saved.CustomerId);
    }

    [Fact]
    public async Task CreateAsync_PlanInactive_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        plan.IsActive = false;
        await context.SaveChangesAsync();
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(BuildDto(plan.Id, periodMonths: null, quantity: 1)));
    }

    [Fact]
    public async Task CreateAsync_PeriodMonthsNoMatchingPrice_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(BuildDto(plan.Id, periodMonths: 6, quantity: 1)));
    }

    [Fact]
    public async Task CreateAsync_InvalidTldPricingId_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));
        var dto = BuildDto(servicePlanId: null, periodMonths: null, quantity: 1);
        dto.TldPricingId = 9999;

        await Assert.ThrowsAsync<NotFoundException>(() => sut.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_TldPricingInactive_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var tldPricing = await SeedTldPricingAsync(context, isActive: false);
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(BuildDomainDto(tldPricing.Id, "myshop", quantity: 1)));
    }

    [Fact]
    public async Task CreateAsync_TldPricingMissingDomainName_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var tldPricing = await SeedTldPricingAsync(context);
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(BuildDomainDto(tldPricing.Id, "", quantity: 1)));
    }

    [Fact]
    public async Task CreateAsync_TldPricingInvalidDomainNameFormat_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var tldPricing = await SeedTldPricingAsync(context);
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(BuildDomainDto(tldPricing.Id, "my shop.com", quantity: 1)));
    }

    [Fact]
    public async Task CreateAsync_TldPricingValidOrder_ComputesTotalPriceAndStoresDomainName()
    {
        using var context = TestDbContextFactory.CreateContext();
        var tldPricing = await SeedTldPricingAsync(context);
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));

        var result = await sut.CreateAsync(BuildDomainDto(tldPricing.Id, "myshop", quantity: 2));

        Assert.Equal(500000m, result.TotalPrice);
        var saved = context.OrderRequests.Single(o => o.Id == result.Id);
        Assert.Equal("myshop", saved.DomainName);
    }

    [Fact]
    public async Task CreateAsync_TldPricingWithPromotionCategoryScope_AppliesDiscount()
    {
        using var context = TestDbContextFactory.CreateContext();
        var tldPricing = await SeedTldPricingAsync(context, categoryId: 601);
        var promotion = await SeedPromotionAsync(
            context, DiscountType.Percentage, discountValue: 20m,
            scopeType: ScopeType.Category, scopedCategoryId: 601);
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));
        var dto = BuildDomainDto(tldPricing.Id, "myshop", quantity: 1);
        dto.PromotionId = promotion.Id;

        var result = await sut.CreateAsync(dto);

        Assert.Equal(200000m, result.TotalPrice);
    }

    [Fact]
    public async Task CreateAsync_TldPricingWithPromotionScopedToDifferentCategory_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var tldPricing = await SeedTldPricingAsync(context, categoryId: 601);
        var promotion = await SeedPromotionAsync(
            context, DiscountType.Percentage, discountValue: 20m,
            scopeType: ScopeType.Category, scopedCategoryId: 999);
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));
        var dto = BuildDomainDto(tldPricing.Id, "myshop", quantity: 1);
        dto.PromotionId = promotion.Id;

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_InvalidPromotionId_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));
        var dto = BuildDto(servicePlanId: null, periodMonths: null, quantity: 1);
        dto.PromotionId = 9999;

        await Assert.ThrowsAsync<NotFoundException>(() => sut.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_PromotionPercentageAllScope_DeductsFromTotalPrice()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var promotion = await SeedPromotionAsync(context, DiscountType.Percentage, discountValue: 10m);
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));
        var dto = BuildDto(plan.Id, periodMonths: 1, quantity: 1);
        dto.PromotionId = promotion.Id;

        var result = await sut.CreateAsync(dto);

        Assert.Equal(90000m, result.TotalPrice);
    }

    [Fact]
    public async Task CreateAsync_PromotionDiscountExceedsMaxDiscountAmount_CapsDiscount()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var promotion = await SeedPromotionAsync(context, DiscountType.Percentage, discountValue: 50m, maxDiscountAmount: 20000m);
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));
        var dto = BuildDto(plan.Id, periodMonths: 1, quantity: 1);
        dto.PromotionId = promotion.Id;

        var result = await sut.CreateAsync(dto);

        Assert.Equal(80000m, result.TotalPrice);
    }

    [Fact]
    public async Task CreateAsync_PromotionWithNoScopeConfigured_AppliesToAnyPlan()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var promotion = new Promotion
        {
            Code = "NOSCOPE",
            Name = "No Scope Promotion",
            DiscountType = DiscountType.Percentage,
            DiscountValue = 10m,
            IsActive = true,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(1),
        };
        context.Promotions.Add(promotion);
        await context.SaveChangesAsync();
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));
        var dto = BuildDto(plan.Id, periodMonths: 1, quantity: 1);
        dto.PromotionId = promotion.Id;

        var result = await sut.CreateAsync(dto);

        Assert.Equal(90000m, result.TotalPrice);
    }

    [Fact]
    public async Task CreateAsync_PromotionScopedToDifferentPlan_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var promotion = await SeedPromotionAsync(context, DiscountType.Percentage, discountValue: 10m, scopeType: ScopeType.Plan, scopedPlanId: 999);
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));
        var dto = BuildDto(plan.Id, periodMonths: 1, quantity: 1);
        dto.PromotionId = promotion.Id;

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_PromotionExpired_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var promotion = await SeedPromotionAsync(
            context, DiscountType.Percentage, discountValue: 10m,
            startDate: DateTime.UtcNow.AddDays(-10), endDate: DateTime.UtcNow.AddDays(-1));
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));
        var dto = BuildDto(plan.Id, periodMonths: 1, quantity: 1);
        dto.PromotionId = promotion.Id;

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_PromotionMinOrderValueNotMet_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var promotion = await SeedPromotionAsync(context, DiscountType.Percentage, discountValue: 10m, minOrderValue: 500000m);
        var sut = new OrderRequestService(TestDbContextFactory.CreateUnitOfWork(context));
        var dto = BuildDto(plan.Id, periodMonths: 1, quantity: 1);
        dto.PromotionId = promotion.Id;

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(dto));
    }
}
