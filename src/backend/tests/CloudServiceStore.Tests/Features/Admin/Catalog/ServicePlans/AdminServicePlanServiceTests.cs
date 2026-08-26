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

    private static UpdateServicePlanDto BuildUpdateDto(ServicePlan plan, List<PlanPriceInputDto> prices) => new()
    {
        CategoryId = plan.CategoryId,
        Name = plan.Name,
        Slug = plan.Slug,
        Sku = plan.Sku,
        IsFeatured = plan.IsFeatured,
        Status = plan.Status,
        AllowGrandfatheredRenewal = plan.AllowGrandfatheredRenewal,
        DisplayOrder = plan.DisplayOrder,
        Prices = prices,
    };

    // Price Versioning: đây là 3 test cốt lõi cho ApplyPriceVersioning (thay "Clear() rồi re-add" cũ
    // vốn xoá sạch lịch sử giá mỗi lần Admin sửa - phá vỡ Grandfathering, xem OrderRequestServiceTests).
    [Fact]
    public async Task UpdateAsync_PriceChangedForExistingPeriod_ClosesOldRowAndCreatesNewVersion()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        var plan = new ServicePlan { Id = 631, CategoryId = category.Id, Name = "Versioned Plan", Slug = "versioned-plan" };
        context.ServicePlans.Add(plan);
        context.PlanPrices.Add(new PlanPrice { Id = 631, PlanId = plan.Id, PeriodMonths = 1, Price = 100000m, IsDefault = true, IsActive = true, Version = 1, IsCurrent = true });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var dto = BuildUpdateDto(plan, [new PlanPriceInputDto { PeriodMonths = 1, Price = 150000m, Currency = "VND", IsDefault = true, IsActive = true }]);
        await sut.UpdateAsync(plan.Id, dto);

        var oldRow = context.PlanPrices.Single(p => p.Id == 631);
        Assert.False(oldRow.IsCurrent);
        Assert.NotNull(oldRow.EffectiveTo);

        var newRow = Assert.Single(context.PlanPrices.Where(p => p.PlanId == plan.Id && p.IsCurrent));
        Assert.Equal(150000m, newRow.Price);
        Assert.Equal(2, newRow.Version);
    }

    [Fact]
    public async Task UpdateAsync_PriceUnchangedForExistingPeriod_DoesNotCreateNewVersion()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        var plan = new ServicePlan { Id = 632, CategoryId = category.Id, Name = "Stable Plan", Slug = "stable-plan" };
        context.ServicePlans.Add(plan);
        context.PlanPrices.Add(new PlanPrice { Id = 632, PlanId = plan.Id, PeriodMonths = 1, Price = 100000m, IsDefault = false, IsActive = true, Version = 1, IsCurrent = true });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        // Chỉ đổi IsDefault (true), giá giữ nguyên 100000 - không được sinh version mới.
        var dto = BuildUpdateDto(plan, [new PlanPriceInputDto { PeriodMonths = 1, Price = 100000m, Currency = "VND", IsDefault = true, IsActive = true }]);
        await sut.UpdateAsync(plan.Id, dto);

        var rows = context.PlanPrices.Where(p => p.PlanId == plan.Id).ToList();
        var row = Assert.Single(rows);
        Assert.Equal(632, row.Id);
        Assert.True(row.IsCurrent);
        Assert.Equal(1, row.Version);
        Assert.True(row.IsDefault);
    }

    [Fact]
    public async Task UpdateAsync_PeriodMonthsRemovedFromForm_ClosesRowWithoutHardDelete()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        var plan = new ServicePlan { Id = 633, CategoryId = category.Id, Name = "Shrinking Plan", Slug = "shrinking-plan" };
        context.ServicePlans.Add(plan);
        context.PlanPrices.Add(new PlanPrice { Id = 633, PlanId = plan.Id, PeriodMonths = 12, Price = 900000m, IsDefault = true, IsActive = true, Version = 1, IsCurrent = true });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        // Admin xoá dòng giá 12 tháng khỏi form -> gửi Prices rỗng.
        var dto = BuildUpdateDto(plan, []);
        await sut.UpdateAsync(plan.Id, dto);

        var row = context.PlanPrices.Single(p => p.Id == 633);
        Assert.False(row.IsCurrent);
        Assert.False(row.IsActive);
        Assert.NotNull(row.EffectiveTo);
    }

    [Fact]
    public async Task UpdateAsync_NewPeriodMonthsAdded_CreatesVersion1Row()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        var plan = new ServicePlan { Id = 634, CategoryId = category.Id, Name = "Growing Plan", Slug = "growing-plan" };
        context.ServicePlans.Add(plan);
        context.PlanPrices.Add(new PlanPrice { Id = 634, PlanId = plan.Id, PeriodMonths = 1, Price = 100000m, IsDefault = true, IsActive = true, Version = 1, IsCurrent = true });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var dto = BuildUpdateDto(plan, [
            new PlanPriceInputDto { PeriodMonths = 1, Price = 100000m, Currency = "VND", IsDefault = true, IsActive = true },
            new PlanPriceInputDto { PeriodMonths = 12, Price = 1000000m, Currency = "VND", IsDefault = false, IsActive = true }
        ]);
        await sut.UpdateAsync(plan.Id, dto);

        var newRow = context.PlanPrices.Single(p => p.PlanId == plan.Id && p.PeriodMonths == 12);
        Assert.Equal(1, newRow.Version);
        Assert.True(newRow.IsCurrent);
    }

    [Fact]
    public async Task CreateAsync_UnknownRegionId_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        var sut = CreateSut(context);

        var dto = new CreateServicePlanDto
        {
            CategoryId = category.Id,
            Name = "New Plan",
            Slug = "new-plan-region",
            RegionId = "does-not-exist",
        };

        await Assert.ThrowsAsync<NotFoundException>(() => sut.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_ValidRegionId_SetsRegionNameInResponse()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        context.Regions.Add(new Region { Id = "test-region-1", Name = "Test DC", City = "Test City", CountryCode = "VN" });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var dto = new CreateServicePlanDto
        {
            CategoryId = category.Id,
            Name = "Regioned Plan",
            Slug = "regioned-plan",
            RegionId = "test-region-1",
        };

        var result = await sut.CreateAsync(dto);

        Assert.Equal("test-region-1", result.RegionId);
        Assert.Equal("Test DC", result.RegionName);
    }

    [Fact]
    public async Task GetListAsync_FilterByRegionId_ReturnsOnlyMatchingRegion()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        context.Regions.Add(new Region { Id = "test-region-2", Name = "Region Two", City = "City", CountryCode = "VN" });
        context.ServicePlans.AddRange(
            new ServicePlan { Id = 641, CategoryId = category.Id, Name = "In Region", Slug = "in-region", RegionId = "test-region-2" },
            new ServicePlan { Id = 642, CategoryId = category.Id, Name = "No Region", Slug = "no-region" });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetListAsync(new ServicePlanQueryParams { RegionId = "test-region-2" });

        Assert.Single(result.Items);
        Assert.Equal("in-region", result.Items[0].Slug);
    }

    [Fact]
    public async Task CreateAsync_UnknownAddonId_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        var sut = CreateSut(context);

        var dto = new CreateServicePlanDto
        {
            CategoryId = category.Id,
            Name = "Plan With Bad Addon",
            Slug = "plan-bad-addon",
            Addons = [new PlanAddonInputDto { AddonId = 9999, MaxQuantity = 1 }],
        };

        await Assert.ThrowsAsync<NotFoundException>(() => sut.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_ValidAddons_ReturnsAddonsInResponse()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        context.Addons.Add(new Addon { Id = 651, Name = "Extra IP", Sku = "ADDON-EXTRA-IP", Type = AddonType.Ip, BillingType = AddonBillingType.PerUnit, UnitName = "IP", PricePerMonth = 30000m, IsActive = true });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var dto = new CreateServicePlanDto
        {
            CategoryId = category.Id,
            Name = "Plan With Addon",
            Slug = "plan-with-addon",
            Addons = [new PlanAddonInputDto { AddonId = 651, MaxQuantity = 3 }],
        };

        var result = await sut.CreateAsync(dto);

        var addon = Assert.Single(result.Addons);
        Assert.Equal("Extra IP", addon.AddonName);
        Assert.Equal(3, addon.MaxQuantity);
    }

    [Fact]
    public async Task UpdateAsync_RemovingAddonFromForm_ClearsFromResponse()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        var addon = new Addon { Id = 652, Name = "Backup", Sku = "ADDON-BACKUP-2", Type = AddonType.ManagedService, BillingType = AddonBillingType.FlatFee, PricePerMonth = 50000m, IsActive = true };
        context.Addons.Add(addon);
        var plan = new ServicePlan { Id = 653, CategoryId = category.Id, Name = "Addon Plan", Slug = "addon-plan" };
        context.ServicePlans.Add(plan);
        context.ServicePlanAddons.Add(new ServicePlanAddon { PlanId = plan.Id, AddonId = addon.Id, MaxQuantity = 1 });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var dto = BuildUpdateDto(plan, []);
        dto.Addons = [];
        var result = await sut.UpdateAsync(plan.Id, dto);

        Assert.Empty(result.Addons);
    }

    // Gói Custom (PackageType=Custom) cần đủ Min/Max/Step + đơn giá vCPU/RAM/Disk - xem
    // AdminServicePlanService.ValidateCustomPackageConfig.
    [Fact]
    public async Task CreateAsync_CustomPackageMissingDimensionBounds_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        var sut = CreateSut(context);

        var dto = new CreateServicePlanDto
        {
            CategoryId = category.Id,
            Name = "Custom Plan",
            Slug = "custom-plan-missing-bounds",
            PackageType = ServicePlanPackageType.Custom,
            MinVcpu = 1,
            MaxVcpu = 8,
            // Thiếu StepVcpu và toàn bộ khối RAM/Disk.
            PricePerVcpuPerMonth = 50000m,
            PricePerRamGbPerMonth = 20000m,
            PricePerDiskGbPerMonth = 5000m,
        };

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_CustomPackageRangeNotDivisibleByStep_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        var sut = CreateSut(context);

        var dto = new CreateServicePlanDto
        {
            CategoryId = category.Id,
            Name = "Custom Plan",
            Slug = "custom-plan-bad-step",
            PackageType = ServicePlanPackageType.Custom,
            MinVcpu = 1,
            MaxVcpu = 10,
            StepVcpu = 4, // (10-1)=9 không chia hết cho 4
            MinRamMb = 1024,
            MaxRamMb = 8192,
            StepRamMb = 1024,
            MinDiskGb = 20,
            MaxDiskGb = 100,
            StepDiskGb = 10,
            PricePerVcpuPerMonth = 50000m,
            PricePerRamGbPerMonth = 20000m,
            PricePerDiskGbPerMonth = 5000m,
        };

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_CustomPackageMissingUnitPrice_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        var sut = CreateSut(context);

        var dto = new CreateServicePlanDto
        {
            CategoryId = category.Id,
            Name = "Custom Plan",
            Slug = "custom-plan-missing-price",
            PackageType = ServicePlanPackageType.Custom,
            MinVcpu = 1,
            MaxVcpu = 8,
            StepVcpu = 1,
            MinRamMb = 1024,
            MaxRamMb = 8192,
            StepRamMb = 1024,
            MinDiskGb = 20,
            MaxDiskGb = 100,
            StepDiskGb = 10,
            // Thiếu PricePerRamGbPerMonth/PricePerDiskGbPerMonth.
            PricePerVcpuPerMonth = 50000m,
        };

        await Assert.ThrowsAsync<ValidationException>(() => sut.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_ValidCustomPackage_CreatesPlanWithDimensionsInResponse()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        var sut = CreateSut(context);

        var dto = new CreateServicePlanDto
        {
            CategoryId = category.Id,
            Name = "Custom Plan",
            Slug = "custom-plan-valid",
            PackageType = ServicePlanPackageType.Custom,
            MinVcpu = 1,
            MaxVcpu = 8,
            StepVcpu = 1,
            MinRamMb = 1024,
            MaxRamMb = 8192,
            StepRamMb = 1024,
            MinDiskGb = 20,
            MaxDiskGb = 100,
            StepDiskGb = 10,
            PricePerVcpuPerMonth = 50000m,
            PricePerRamGbPerMonth = 20000m,
            PricePerDiskGbPerMonth = 5000m,
            Prices = [new PlanPriceInputDto { PeriodMonths = 1, Price = 0m, Currency = "VND", IsDefault = true, IsActive = true, DiscountPercent = 0m }],
        };

        var result = await sut.CreateAsync(dto);

        Assert.Equal("Custom", result.PackageType);
        Assert.Equal(1, result.MinVcpu);
        Assert.Equal(8, result.MaxVcpu);
        Assert.Equal(50000m, result.PricePerVcpuPerMonth);
    }

    // Sửa 1 gói Custom, chỉ đổi DiscountPercent (Price giữ 0 vì bị bỏ qua với Custom) - vẫn phải sinh
    // version mới đúng như Fixed, xem ApplyPriceVersioning.
    [Fact]
    public async Task UpdateAsync_CustomPackageDiscountPercentChanged_ClosesOldRowAndCreatesNewVersion()
    {
        using var context = TestDbContextFactory.CreateContext();
        var category = await SeedCategoryAsync(context);
        var plan = new ServicePlan
        {
            Id = 661,
            CategoryId = category.Id,
            Name = "Custom Versioned",
            Slug = "custom-versioned",
            PackageType = ServicePlanPackageType.Custom,
            MinVcpu = 1,
            MaxVcpu = 8,
            StepVcpu = 1,
            MinRamMb = 1024,
            MaxRamMb = 8192,
            StepRamMb = 1024,
            MinDiskGb = 20,
            MaxDiskGb = 100,
            StepDiskGb = 10,
            PricePerVcpuPerMonth = 50000m,
            PricePerRamGbPerMonth = 20000m,
            PricePerDiskGbPerMonth = 5000m,
        };
        context.ServicePlans.Add(plan);
        context.PlanPrices.Add(new PlanPrice { Id = 661, PlanId = plan.Id, PeriodMonths = 12, Price = 0m, DiscountPercent = 10m, IsDefault = true, IsActive = true, Version = 1, IsCurrent = true });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var dto = BuildUpdateDto(plan, [new PlanPriceInputDto { PeriodMonths = 12, Price = 0m, Currency = "VND", IsDefault = true, IsActive = true, DiscountPercent = 15m }]);
        dto.PackageType = ServicePlanPackageType.Custom;
        dto.MinVcpu = plan.MinVcpu; dto.MaxVcpu = plan.MaxVcpu; dto.StepVcpu = plan.StepVcpu;
        dto.MinRamMb = plan.MinRamMb; dto.MaxRamMb = plan.MaxRamMb; dto.StepRamMb = plan.StepRamMb;
        dto.MinDiskGb = plan.MinDiskGb; dto.MaxDiskGb = plan.MaxDiskGb; dto.StepDiskGb = plan.StepDiskGb;
        dto.PricePerVcpuPerMonth = plan.PricePerVcpuPerMonth;
        dto.PricePerRamGbPerMonth = plan.PricePerRamGbPerMonth;
        dto.PricePerDiskGbPerMonth = plan.PricePerDiskGbPerMonth;
        await sut.UpdateAsync(plan.Id, dto);

        var oldRow = context.PlanPrices.Single(p => p.Id == 661);
        Assert.False(oldRow.IsCurrent);

        var newRow = Assert.Single(context.PlanPrices.Where(p => p.PlanId == plan.Id && p.IsCurrent));
        Assert.Equal(15m, newRow.DiscountPercent);
        Assert.Equal(2, newRow.Version);
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
