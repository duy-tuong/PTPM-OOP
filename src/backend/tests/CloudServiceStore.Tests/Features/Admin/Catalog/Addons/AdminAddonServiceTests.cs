using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Features.Admin.Catalog.Addons;
using CloudServiceStore.Application.Features.Admin.Catalog.Addons.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;

namespace CloudServiceStore.Tests.Features.Admin.Catalog.Addons;

public class AdminAddonServiceTests
{
    // Id cố ý khác dữ liệu HasData (Addon 1-4 đã seed sẵn trong model).
    private static AdminAddonService CreateSut(AppDbContext context) =>
        new(TestDbContextFactory.CreateUnitOfWork(context));

    private static CreateAddonDto BuildCreateDto(string sku = "ADDON-TEST-1") => new()
    {
        Name = "Test Addon",
        Sku = sku,
        Type = AddonType.Ip,
        BillingType = AddonBillingType.PerUnit,
        UnitName = "IP",
        PricePerMonth = 30000m,
        IsActive = true,
    };

    [Fact]
    public async Task CreateAsync_ValidDto_CreatesAddon()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        var result = await sut.CreateAsync(BuildCreateDto());

        Assert.Equal("ADDON-TEST-1", result.Sku);
        Assert.Equal("Ip", result.Type);
        Assert.Equal("PerUnit", result.BillingType);
    }

    [Fact]
    public async Task CreateAsync_DuplicateSku_ThrowsConflictException()
    {
        using var context = TestDbContextFactory.CreateContext();
        context.Addons.Add(new Addon { Id = 601, Name = "Existing", Sku = "ADDON-DUP", Type = AddonType.Disk, BillingType = AddonBillingType.PerUnit, PricePerMonth = 1000m });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ConflictException>(() => sut.CreateAsync(BuildCreateDto(sku: "ADDON-DUP")));
    }

    [Fact]
    public async Task UpdateAsync_NotFound_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<NotFoundException>(() => sut.UpdateAsync(9999, new UpdateAddonDto { Name = "X", Sku = "X", Type = AddonType.Ip, BillingType = AddonBillingType.FlatFee, PricePerMonth = 1 }));
    }

    [Fact]
    public async Task DeleteAsync_NotReferenced_RemovesAddon()
    {
        using var context = TestDbContextFactory.CreateContext();
        context.Addons.Add(new Addon { Id = 602, Name = "Unused", Sku = "ADDON-UNUSED", Type = AddonType.Disk, BillingType = AddonBillingType.PerUnit, PricePerMonth = 1000m });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        await sut.DeleteAsync(602);

        Assert.Empty(context.Addons.Where(a => a.Id == 602));
    }

    [Fact]
    public async Task DeleteAsync_ReferencedByPastOrder_ThrowsConflictException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var addon = new Addon { Id = 603, Name = "Purchased", Sku = "ADDON-PURCHASED", Type = AddonType.Disk, BillingType = AddonBillingType.PerUnit, PricePerMonth = 1000m };
        context.Addons.Add(addon);
        context.OrderRequestItemAddons.Add(new OrderRequestItemAddon { OrderRequestItemId = 1, AddonId = 603, Quantity = 1, UnitPrice = 1000m, LineTotal = 1000m });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ConflictException>(() => sut.DeleteAsync(603));
    }
}
