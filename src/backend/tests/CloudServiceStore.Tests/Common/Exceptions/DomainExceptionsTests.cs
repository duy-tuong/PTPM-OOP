using CloudServiceStore.Application.Common.Exceptions;

namespace CloudServiceStore.Tests.Common.Exceptions;

public class DomainExceptionsTests
{
    [Fact]
    public void NotFoundException_EntityAndKeyCtor_FormatsMessage()
    {
        var exception = new NotFoundException("ServicePlan", "vps-ssd-starter");

        Assert.Equal("Không tìm thấy ServicePlan với id 'vps-ssd-starter'.", exception.Message);
    }

    [Fact]
    public void ConflictException_MessageCtor_SetsMessage()
    {
        var exception = new ConflictException("Slug đã tồn tại.");

        Assert.Equal("Slug đã tồn tại.", exception.Message);
    }
}
