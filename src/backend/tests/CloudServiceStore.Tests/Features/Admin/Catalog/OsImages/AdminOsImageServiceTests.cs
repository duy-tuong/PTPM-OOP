using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Features.Admin.Catalog.OsImages;
using CloudServiceStore.Application.Features.Admin.Catalog.OsImages.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;

namespace CloudServiceStore.Tests.Features.Admin.Catalog.OsImages;

public class AdminOsImageServiceTests
{
    // Id cố ý khác dữ liệu HasData (OsImage 1-7 đã seed sẵn trong model).
    private static AdminOsImageService CreateSut(AppDbContext context) =>
        new(TestDbContextFactory.CreateUnitOfWork(context));

    private static CreateOsImageDto BuildCreateDto(string slug = "test-os-1", OsFamily family = OsFamily.Linux, decimal? windowsFee = null) => new()
    {
        Name = "Test OS",
        Slug = slug,
        Family = family,
        WindowsLicenseFeePerMonth = windowsFee,
        IsActive = true,
    };

    [Fact]
    public async Task CreateAsync_ValidDto_CreatesOsImage()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        var result = await sut.CreateAsync(BuildCreateDto());

        Assert.Equal("test-os-1", result.Slug);
        Assert.Equal("Linux", result.Family);
    }

    [Fact]
    public async Task CreateAsync_DuplicateSlug_ThrowsConflictException()
    {
        using var context = TestDbContextFactory.CreateContext();
        context.OsImages.Add(new OsImage { Id = 601, Name = "Existing", Slug = "os-dup", Family = OsFamily.Linux, IsActive = true });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ConflictException>(() => sut.CreateAsync(BuildCreateDto(slug: "os-dup")));
    }

    [Fact]
    public async Task CreateAsync_LinuxWithFeeSubmitted_IgnoresFee()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        // Admin lỡ nhập phí khi đang chọn Linux (vd đổi Family qua lại) - phải bị bỏ qua, không lưu.
        var result = await sut.CreateAsync(BuildCreateDto(family: OsFamily.Linux, windowsFee: 999999m));

        Assert.Null(result.WindowsLicenseFeePerMonth);
    }

    [Fact]
    public async Task CreateAsync_WindowsWithFee_SavesFee()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        var result = await sut.CreateAsync(BuildCreateDto(family: OsFamily.Windows, windowsFee: 350000m));

        Assert.Equal(350000m, result.WindowsLicenseFeePerMonth);
    }

    [Fact]
    public async Task UpdateAsync_NotFound_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            sut.UpdateAsync(9999, new UpdateOsImageDto { Name = "X", Slug = "x", Family = OsFamily.Linux }));
    }

    [Fact]
    public async Task DeleteAsync_NotReferenced_RemovesOsImage()
    {
        using var context = TestDbContextFactory.CreateContext();
        context.OsImages.Add(new OsImage { Id = 602, Name = "Unused", Slug = "os-unused", Family = OsFamily.Linux, IsActive = true });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        await sut.DeleteAsync(602);

        Assert.Empty(context.OsImages.Where(o => o.Id == 602));
    }

    [Fact]
    public async Task DeleteAsync_ReferencedByPastOrder_ThrowsConflictException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var osImage = new OsImage { Id = 603, Name = "Purchased", Slug = "os-purchased", Family = OsFamily.Linux, IsActive = true };
        context.OsImages.Add(osImage);
        context.OrderRequestItems.Add(new OrderRequestItem
        {
            OrderRequestId = 1,
            ServicePlanId = 1,
            Quantity = 1,
            UnitPrice = 100000m,
            LineTotal = 100000m,
            OsImageId = 603,
            OsImageName = "Purchased",
        });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ConflictException>(() => sut.DeleteAsync(603));
    }
}
