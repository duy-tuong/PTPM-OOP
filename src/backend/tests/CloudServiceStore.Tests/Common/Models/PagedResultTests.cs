using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Tests.Common.Models;

public class PagedResultTests
{
    [Fact]
    public void TotalPages_RoundsUpForPartialLastPage()
    {
        var result = PagedResult<int>.Create([], totalCount: 25, pageNumber: 1, pageSize: 10);

        Assert.Equal(3, result.TotalPages);
    }

    [Fact]
    public void TotalPages_PageSizeZero_ReturnsZero()
    {
        var result = PagedResult<int>.Create([], totalCount: 25, pageNumber: 1, pageSize: 0);

        Assert.Equal(0, result.TotalPages);
    }

    [Fact]
    public void HasPreviousPage_And_HasNextPage_BoundaryValues()
    {
        var firstPage = PagedResult<int>.Create([], totalCount: 25, pageNumber: 1, pageSize: 10);
        var lastPage = PagedResult<int>.Create([], totalCount: 25, pageNumber: 3, pageSize: 10);

        Assert.False(firstPage.HasPreviousPage);
        Assert.True(firstPage.HasNextPage);
        Assert.True(lastPage.HasPreviousPage);
        Assert.False(lastPage.HasNextPage);
    }
}
