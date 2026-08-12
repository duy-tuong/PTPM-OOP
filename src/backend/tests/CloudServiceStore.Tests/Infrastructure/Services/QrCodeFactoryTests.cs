using CloudServiceStore.Infrastructure.Services;

namespace CloudServiceStore.Tests.Infrastructure.Services;

public class QrCodeFactoryTests
{
    private readonly QrCodeFactory _sut = new();

    [Fact]
    public void GenerateForServicePlan_ReturnsBase64PngDataUri()
    {
        var result = _sut.GenerateForServicePlan(1, "vps-ssd-starter");

        Assert.StartsWith("data:image/png;base64,", result);
    }

    [Fact]
    public void GenerateForServicePlan_DifferentSlugs_ProduceDifferentOutput()
    {
        var result1 = _sut.GenerateForServicePlan(1, "vps-ssd-starter");
        var result2 = _sut.GenerateForServicePlan(2, "vps-ssd-business");

        Assert.NotEqual(result1, result2);
    }
}
