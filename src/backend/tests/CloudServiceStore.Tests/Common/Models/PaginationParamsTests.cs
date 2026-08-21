using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Tests.Common.Models;

public class PaginationParamsTests
{
    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public void PageSize_ZeroOrNegative_DefaultsTo20(int input)
    {
        var sut = new PaginationParams { PageSize = input };

        Assert.Equal(20, sut.PageSize);
    }

    [Fact]
    public void PageSize_ExceedsMax_ClampedTo100()
    {
        var sut = new PaginationParams { PageSize = 500 };

        Assert.Equal(100, sut.PageSize);
    }

    [Fact]
    public void PageSize_ValidValue_PassesThroughUnchanged()
    {
        var sut = new PaginationParams { PageSize = 30 };

        Assert.Equal(30, sut.PageSize);
    }
}
