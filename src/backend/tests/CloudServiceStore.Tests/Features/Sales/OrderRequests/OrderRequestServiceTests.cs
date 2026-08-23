using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Sales.OrderRequests;
using CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Domain.Entities.Marketing;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;
using Moq;

namespace CloudServiceStore.Tests.Features.Sales.OrderRequests;

public class OrderRequestServiceTests
{
    private readonly Mock<IEmailService> _emailServiceMock = new();
    private readonly Mock<IAppSettings> _appSettingsMock = new();

    public OrderRequestServiceTests()
    {
        _appSettingsMock.SetupGet(a => a.PublicBaseUrl).Returns("http://localhost:3000");
    }

    private OrderRequestService CreateSut(AppDbContext context) => new(
        TestDbContextFactory.CreateUnitOfWork(context),
        _emailServiceMock.Object,
        _appSettingsMock.Object);

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

    // Role riêng ID tự chọn (khác HasData Id 1-3) - cùng lý do các seed helper khác trong file này
    // không phụ thuộc HasData: test không nên phụ thuộc việc InMemory provider có tự nạp seed data hay không.
    private static async Task<Customer> SeedCustomerAsync(AppDbContext context, int roleId, string email = "renewal-customer@example.com")
    {
        context.AppRoles.Add(new AppRole { Id = roleId, Name = $"Test Role {roleId}", Description = "Test" });
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            RoleId = roleId,
            Email = email,
            PasswordHash = "hash",
            FullName = "Renewal Customer",
            Phone = "0900000099",
            CustomerType = CustomerType.Individual
        };
        context.Customers.Add(customer);
        await context.SaveChangesAsync();
        return customer;
    }

    // Kịch bản gia hạn: 1 khách hàng thật + 1 item ServicePlan "đang sống" (đơn riêng, đã Completed).
    private static async Task<(Customer Customer, OrderRequestItem OriginalItem)> SeedRenewalOriginalAsync(
        AppDbContext context, ServicePlan plan, int roleId = 901)
    {
        var customer = await SeedCustomerAsync(context, roleId);
        var originalOrder = new OrderRequest
        {
            OrderCode = "ORD-ORIGINAL-TEST",
            CustomerId = customer.Id,
            CustomerType = CustomerType.Individual,
            CustomerName = customer.FullName,
            CustomerEmail = customer.Email,
            CustomerPhone = customer.Phone!,
            TotalPrice = 100000m,
            Status = OrderRequestStatus.Completed,
            CreatedAt = DateTime.UtcNow,
            Items = { new OrderRequestItem { ServicePlanId = plan.Id, PeriodMonths = 1, Quantity = 1, UnitPrice = 100000m, LineTotal = 100000m } }
        };
        context.OrderRequests.Add(originalOrder);
        await context.SaveChangesAsync();
        return (customer, originalOrder.Items.Single());
    }

    private static CreateOrderRequestDto BuildDomainDto(int tldPricingId, string domainName, int quantity) => new()
    {
        CustomerType = CustomerType.Individual,
        CustomerName = "Test Customer",
        CustomerEmail = "test@example.com",
        CustomerPhone = "0900000000",
        Items = { new CreateOrderRequestItemDto { TldPricingId = tldPricingId, DomainName = domainName, Quantity = quantity } }
    };

    private static CreateOrderRequestDto BuildDto(int? servicePlanId, int? periodMonths, int quantity) => new()
    {
        CustomerType = CustomerType.Individual,
        CustomerName = "Test Customer",
        CustomerEmail = "test@example.com",
        CustomerPhone = "0900000000",
        Items = { new CreateOrderRequestItemDto { ServicePlanId = servicePlanId, PeriodMonths = periodMonths, Quantity = quantity } }
    };

    [Fact]
    public async Task CreateAsync_PlanNotFound_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<NotFoundException>(() => sut.CreateAsync(BuildDto(servicePlanId: 9999, periodMonths: null, quantity: 1)));
    }

    [Fact]
    public async Task CreateAsync_PeriodMonthsSpecified_UsesMatchingPlanPrice()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var sut = CreateSut(context);

        var result = await sut.CreateAsync(BuildDto(plan.Id, periodMonths: 1, quantity: 2));

        Assert.Equal(200000m, result.TotalPrice);
    }

    [Fact]
    public async Task CreateAsync_NoPeriodSpecified_UsesDefaultPlanPrice()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var sut = CreateSut(context);

        var result = await sut.CreateAsync(BuildDto(plan.Id, periodMonths: null, quantity: 1));

        Assert.Equal(100000m, result.TotalPrice);
    }

    [Fact]
    public async Task CreateAsync_PromotionalPriceSet_UsesPromotionalPriceTimesQuantity()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var sut = CreateSut(context);

        var result = await sut.CreateAsync(BuildDto(plan.Id, periodMonths: 12, quantity: 3));

        Assert.Equal(2700000m, result.TotalPrice);
    }

    [Fact]
    public async Task CreateAsync_CustomerIdProvided_LinksOrderToCustomer()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var sut = CreateSut(context);
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
        var sut = CreateSut(context);

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
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(BuildDto(plan.Id, periodMonths: null, quantity: 1)));
    }

    [Fact]
    public async Task CreateAsync_PeriodMonthsNoMatchingPrice_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(BuildDto(plan.Id, periodMonths: 6, quantity: 1)));
    }

    [Fact]
    public async Task CreateAsync_InvalidTldPricingId_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);
        var dto = BuildDomainDto(tldPricingId: 9999, domainName: "myshop", quantity: 1);

        await Assert.ThrowsAsync<NotFoundException>(() => sut.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_TldPricingInactive_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var tldPricing = await SeedTldPricingAsync(context, isActive: false);
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(BuildDomainDto(tldPricing.Id, "myshop", quantity: 1)));
    }

    [Fact]
    public async Task CreateAsync_TldPricingMissingDomainName_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var tldPricing = await SeedTldPricingAsync(context);
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(BuildDomainDto(tldPricing.Id, "", quantity: 1)));
    }

    [Fact]
    public async Task CreateAsync_TldPricingInvalidDomainNameFormat_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var tldPricing = await SeedTldPricingAsync(context);
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(BuildDomainDto(tldPricing.Id, "my shop.com", quantity: 1)));
    }

    [Fact]
    public async Task CreateAsync_TldPricingValidOrder_ComputesTotalPriceAndStoresDomainName()
    {
        using var context = TestDbContextFactory.CreateContext();
        var tldPricing = await SeedTldPricingAsync(context);
        var sut = CreateSut(context);

        var result = await sut.CreateAsync(BuildDomainDto(tldPricing.Id, "myshop", quantity: 2));

        Assert.Equal(500000m, result.TotalPrice);
        var saved = context.OrderRequests.Single(o => o.Id == result.Id);
        Assert.Equal("myshop", saved.Items.Single().DomainName);
    }

    [Fact]
    public async Task CreateAsync_TldPricingWithPromotionCategoryScope_AppliesDiscount()
    {
        using var context = TestDbContextFactory.CreateContext();
        var tldPricing = await SeedTldPricingAsync(context, categoryId: 601);
        var promotion = await SeedPromotionAsync(
            context, DiscountType.Percentage, discountValue: 20m,
            scopeType: ScopeType.Category, scopedCategoryId: 601);
        var sut = CreateSut(context);
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
        var sut = CreateSut(context);
        var dto = BuildDomainDto(tldPricing.Id, "myshop", quantity: 1);
        dto.PromotionId = promotion.Id;

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_InvalidPromotionId_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);
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
        var sut = CreateSut(context);
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
        var sut = CreateSut(context);
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
        var sut = CreateSut(context);
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
        var sut = CreateSut(context);
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
        var sut = CreateSut(context);
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
        var sut = CreateSut(context);
        var dto = BuildDto(plan.Id, periodMonths: 1, quantity: 1);
        dto.PromotionId = promotion.Id;

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_MultipleItems_SumsLineTotalsIntoGrandTotal()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var tldPricing = await SeedTldPricingAsync(context);
        var sut = CreateSut(context);
        var dto = new CreateOrderRequestDto
        {
            CustomerType = CustomerType.Individual,
            CustomerName = "Test Customer",
            CustomerEmail = "test@example.com",
            CustomerPhone = "0900000000",
            Items =
            {
                new CreateOrderRequestItemDto { ServicePlanId = plan.Id, PeriodMonths = 1, Quantity = 2 },
                new CreateOrderRequestItemDto { TldPricingId = tldPricing.Id, DomainName = "myshop", Quantity = 1 }
            }
        };

        var result = await sut.CreateAsync(dto);

        Assert.Equal(450000m, result.TotalPrice);
        var saved = context.OrderRequests.Single(o => o.Id == result.Id);
        Assert.Equal(2, saved.Items.Count);
    }

    [Fact]
    public async Task CreateAsync_ItemMissingBothProductFields_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);
        var dto = new CreateOrderRequestDto
        {
            CustomerType = CustomerType.Individual,
            CustomerName = "Test Customer",
            CustomerEmail = "test@example.com",
            CustomerPhone = "0900000000",
            Items = { new CreateOrderRequestItemDto { Quantity = 1 } }
        };

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_ItemWithBothProductFields_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var tldPricing = await SeedTldPricingAsync(context);
        var sut = CreateSut(context);
        var dto = new CreateOrderRequestDto
        {
            CustomerType = CustomerType.Individual,
            CustomerName = "Test Customer",
            CustomerEmail = "test@example.com",
            CustomerPhone = "0900000000",
            Items = { new CreateOrderRequestItemDto { ServicePlanId = plan.Id, TldPricingId = tldPricing.Id, DomainName = "myshop", Quantity = 1 } }
        };

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_PromotionMatchesOnlySomeItems_DiscountsOnlyMatchedLines()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var tldPricing = await SeedTldPricingAsync(context, categoryId: 601);
        var promotion = await SeedPromotionAsync(
            context, DiscountType.Percentage, discountValue: 10m,
            scopeType: ScopeType.Category, scopedCategoryId: plan.CategoryId);
        var sut = CreateSut(context);
        var dto = new CreateOrderRequestDto
        {
            CustomerType = CustomerType.Individual,
            CustomerName = "Test Customer",
            CustomerEmail = "test@example.com",
            CustomerPhone = "0900000000",
            PromotionId = promotion.Id,
            Items =
            {
                new CreateOrderRequestItemDto { ServicePlanId = plan.Id, PeriodMonths = 1, Quantity = 1 },
                new CreateOrderRequestItemDto { TldPricingId = tldPricing.Id, DomainName = "myshop", Quantity = 1 }
            }
        };

        var result = await sut.CreateAsync(dto);

        // Gói 100000đ khớp scope Category -> giảm 10% = 10000; dòng tên miền 250000đ khác category
        // không bị giảm. Tổng đúng = (100000 + 250000) - 10000 = 340000, không phải giảm cả 350000.
        Assert.Equal(340000m, result.TotalPrice);
    }

    [Fact]
    public async Task GetByCodeAsync_ExistingOrder_ReturnsLookupDtoWithBankInfo()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        _appSettingsMock.SetupGet(a => a.BankName).Returns("Ngân hàng Test");
        _appSettingsMock.SetupGet(a => a.BankAccountNumber).Returns("999888777");
        _appSettingsMock.SetupGet(a => a.BankAccountHolder).Returns("CLOUDVERSE");
        var sut = CreateSut(context);
        var created = await sut.CreateAsync(BuildDto(plan.Id, periodMonths: 1, quantity: 2));
        var orderCode = context.OrderRequests.Single(o => o.Id == created.Id).OrderCode;

        var result = await sut.GetByCodeAsync(orderCode);

        Assert.Equal(orderCode, result.OrderCode);
        Assert.Equal(200000m, result.TotalPrice);
        Assert.Equal("New", result.Status);
        Assert.Single(result.Items);
        Assert.Equal("Test Plan", result.Items[0].ProductName);
        Assert.Equal(2, result.Items[0].Quantity);
        Assert.Equal("Ngân hàng Test", result.BankName);
        Assert.Equal("999888777", result.BankAccountNumber);
        Assert.Equal("CLOUDVERSE", result.BankAccountHolder);
    }

    [Fact]
    public async Task GetByCodeAsync_UnknownOrderCode_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<NotFoundException>(() => sut.GetByCodeAsync("ORD-DOES-NOT-EXIST"));
    }

    [Fact]
    public async Task CreateRenewalAsync_ItemNotFound_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            sut.CreateRenewalAsync(new CreateRenewalOrderRequestDto { OrderRequestItemId = 9999 }, Guid.NewGuid()));
    }

    [Fact]
    public async Task CreateRenewalAsync_ItemBelongsToDifferentCustomer_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var (_, originalItem) = await SeedRenewalOriginalAsync(context, plan, roleId: 901);
        var otherCustomer = await SeedCustomerAsync(context, roleId: 902, email: "other@example.com");
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            sut.CreateRenewalAsync(new CreateRenewalOrderRequestDto { OrderRequestItemId = originalItem.Id }, otherCustomer.Id));
    }

    [Fact]
    public async Task CreateRenewalAsync_ServicePlanItem_CreatesOrderWithRenewsFromItemIdAndSourceRenewal()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var (customer, originalItem) = await SeedRenewalOriginalAsync(context, plan);
        var sut = CreateSut(context);

        var result = await sut.CreateRenewalAsync(new CreateRenewalOrderRequestDto { OrderRequestItemId = originalItem.Id, PeriodMonths = 1 }, customer.Id);

        var savedOrder = context.OrderRequests.Single(o => o.Id == result.Id);
        var savedItem = Assert.Single(savedOrder.Items);
        Assert.Equal(originalItem.Id, savedItem.RenewsFromItemId);
        Assert.Equal("renewal", savedOrder.Source);
    }

    [Fact]
    public async Task CreateRenewalAsync_TldItem_UsesRenewPriceNotRegisterPrice()
    {
        using var context = TestDbContextFactory.CreateContext();
        var tldPricing = await SeedTldPricingAsync(context); // RegisterPrice=250000, RenewPrice=300000
        var customer = await SeedCustomerAsync(context, roleId: 901);
        var originalOrder = new OrderRequest
        {
            OrderCode = "ORD-ORIGINAL-TLD",
            CustomerId = customer.Id,
            CustomerType = CustomerType.Individual,
            CustomerName = customer.FullName,
            CustomerEmail = customer.Email,
            CustomerPhone = customer.Phone!,
            TotalPrice = 250000m,
            Status = OrderRequestStatus.Completed,
            CreatedAt = DateTime.UtcNow,
            Items = { new OrderRequestItem { TldPricingId = tldPricing.Id, DomainName = "myshop", Quantity = 1, UnitPrice = 250000m, LineTotal = 250000m } }
        };
        context.OrderRequests.Add(originalOrder);
        await context.SaveChangesAsync();
        var originalItem = originalOrder.Items.Single();
        var sut = CreateSut(context);

        var result = await sut.CreateRenewalAsync(new CreateRenewalOrderRequestDto { OrderRequestItemId = originalItem.Id, Years = 1 }, customer.Id);

        Assert.Equal(300000m, result.TotalPrice);
    }

    [Fact]
    public async Task CreateRenewalAsync_NoPeriodSpecified_DefaultsToOriginalPeriod()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var (customer, originalItem) = await SeedRenewalOriginalAsync(context, plan); // original PeriodMonths = 1 -> giá 100000

        var sut = CreateSut(context);

        var result = await sut.CreateRenewalAsync(new CreateRenewalOrderRequestDto { OrderRequestItemId = originalItem.Id }, customer.Id);

        Assert.Equal(100000m, result.TotalPrice);
    }

    [Fact]
    public async Task CreateRenewalAsync_CopiesCustomerInfoFromProfile()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var (customer, originalItem) = await SeedRenewalOriginalAsync(context, plan);
        var sut = CreateSut(context);

        var result = await sut.CreateRenewalAsync(new CreateRenewalOrderRequestDto { OrderRequestItemId = originalItem.Id }, customer.Id);

        var savedOrder = context.OrderRequests.Single(o => o.Id == result.Id);
        Assert.Equal(customer.FullName, savedOrder.CustomerName);
        Assert.Equal(customer.Email, savedOrder.CustomerEmail);
        Assert.Equal(customer.Phone, savedOrder.CustomerPhone);
    }

    [Fact]
    public async Task CreateRenewalAsync_RenewalItemItself_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var (customer, originalItem) = await SeedRenewalOriginalAsync(context, plan);
        var renewalReceiptOrder = new OrderRequest
        {
            OrderCode = "ORD-RENEWAL-RECEIPT",
            CustomerId = customer.Id,
            CustomerType = CustomerType.Individual,
            CustomerName = customer.FullName,
            CustomerEmail = customer.Email,
            CustomerPhone = customer.Phone!,
            TotalPrice = 100000m,
            Status = OrderRequestStatus.Completed,
            CreatedAt = DateTime.UtcNow,
            Items = { new OrderRequestItem { ServicePlanId = plan.Id, PeriodMonths = 1, Quantity = 1, UnitPrice = 100000m, LineTotal = 100000m, RenewsFromItemId = originalItem.Id } }
        };
        context.OrderRequests.Add(renewalReceiptOrder);
        await context.SaveChangesAsync();
        var receiptItem = renewalReceiptOrder.Items.Single();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ValidationException>(() =>
            sut.CreateRenewalAsync(new CreateRenewalOrderRequestDto { OrderRequestItemId = receiptItem.Id }, customer.Id));
    }

    [Fact]
    public async Task GetMyServicesAsync_ExcludesOtherCustomersAndRenewalReceiptItems()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var (customer, originalItem) = await SeedRenewalOriginalAsync(context, plan);
        var (_, otherCustomerItem) = await SeedRenewalOriginalAsync(context, plan, roleId: 902);

        // Biên lai gia hạn của chính customer - KHÔNG được xuất hiện trong "Dịch vụ của tôi".
        var renewalReceiptOrder = new OrderRequest
        {
            OrderCode = "ORD-RENEWAL-RECEIPT-SVC",
            CustomerId = customer.Id,
            CustomerType = CustomerType.Individual,
            CustomerName = customer.FullName,
            CustomerEmail = customer.Email,
            CustomerPhone = customer.Phone!,
            TotalPrice = 100000m,
            Status = OrderRequestStatus.Completed,
            CreatedAt = DateTime.UtcNow,
            Items = { new OrderRequestItem { ServicePlanId = plan.Id, PeriodMonths = 1, Quantity = 1, UnitPrice = 100000m, LineTotal = 100000m, RenewsFromItemId = originalItem.Id } }
        };
        context.OrderRequests.Add(renewalReceiptOrder);
        await context.SaveChangesAsync();

        var sut = CreateSut(context);

        var result = await sut.GetMyServicesAsync(customer.Id, new PaginationParams());

        var item = Assert.Single(result.Items);
        Assert.Equal(originalItem.Id, item.ItemId);
        Assert.DoesNotContain(result.Items, i => i.ItemId == otherCustomerItem.Id);
    }

    [Fact]
    public async Task GetMyServicesAsync_OrdersByExpiresAtAscendingWithNullsLast()
    {
        using var context = TestDbContextFactory.CreateContext();
        var plan = await SeedPlanWithPricesAsync(context);
        var customer = await SeedCustomerAsync(context, roleId: 901);

        var soonOrder = new OrderRequest
        {
            OrderCode = "ORD-SOON",
            CustomerId = customer.Id,
            CustomerType = CustomerType.Individual,
            CustomerName = customer.FullName,
            CustomerEmail = customer.Email,
            CustomerPhone = customer.Phone!,
            TotalPrice = 100000m,
            Status = OrderRequestStatus.Completed,
            CreatedAt = DateTime.UtcNow,
            Items = { new OrderRequestItem { ServicePlanId = plan.Id, PeriodMonths = 1, Quantity = 1, UnitPrice = 100000m, LineTotal = 100000m, ExpiresAt = DateTime.UtcNow.AddDays(5) } }
        };
        var laterOrder = new OrderRequest
        {
            OrderCode = "ORD-LATER",
            CustomerId = customer.Id,
            CustomerType = CustomerType.Individual,
            CustomerName = customer.FullName,
            CustomerEmail = customer.Email,
            CustomerPhone = customer.Phone!,
            TotalPrice = 100000m,
            Status = OrderRequestStatus.Completed,
            CreatedAt = DateTime.UtcNow,
            Items = { new OrderRequestItem { ServicePlanId = plan.Id, PeriodMonths = 1, Quantity = 1, UnitPrice = 100000m, LineTotal = 100000m, ExpiresAt = DateTime.UtcNow.AddDays(30) } }
        };
        var notCompletedOrder = new OrderRequest
        {
            OrderCode = "ORD-NOT-COMPLETED",
            CustomerId = customer.Id,
            CustomerType = CustomerType.Individual,
            CustomerName = customer.FullName,
            CustomerEmail = customer.Email,
            CustomerPhone = customer.Phone!,
            TotalPrice = 100000m,
            Status = OrderRequestStatus.New,
            CreatedAt = DateTime.UtcNow,
            Items = { new OrderRequestItem { ServicePlanId = plan.Id, PeriodMonths = 1, Quantity = 1, UnitPrice = 100000m, LineTotal = 100000m } }
        };
        context.OrderRequests.AddRange(laterOrder, notCompletedOrder, soonOrder);
        await context.SaveChangesAsync();

        var sut = CreateSut(context);

        var result = await sut.GetMyServicesAsync(customer.Id, new PaginationParams());

        Assert.Equal(3, result.Items.Count);
        Assert.Equal("ORD-SOON", result.Items[0].OrderCode);
        Assert.Equal("ORD-LATER", result.Items[1].OrderCode);
        Assert.Equal("ORD-NOT-COMPLETED", result.Items[2].OrderCode);
    }
}
