using CloudServiceStore.Infrastructure.Services;

namespace CloudServiceStore.Tests.Infrastructure.Services;

public class FakeProvisioningGeneratorTests
{
    private static readonly string[] DocumentationRangePrefixes = ["192.0.2.", "198.51.100.", "203.0.113."];

    [Fact]
    public void GenerateServerCredentials_ReturnsIpInOneOfTheDocumentationRanges()
    {
        var sut = new FakeProvisioningGenerator();

        var (ipAddress, _) = sut.GenerateServerCredentials(hasSshKey: false);

        Assert.Contains(DocumentationRangePrefixes, prefix => ipAddress.StartsWith(prefix));
        var hostOctet = int.Parse(ipAddress.Split('.')[^1]);
        Assert.InRange(hostOctet, 2, 254);
    }

    [Fact]
    public void GenerateServerCredentials_HasSshKeyFalse_ReturnsNonEmptyPasswordOfExpectedLength()
    {
        var sut = new FakeProvisioningGenerator();

        var (_, rootPassword) = sut.GenerateServerCredentials(hasSshKey: false);

        Assert.NotNull(rootPassword);
        Assert.Equal(16, rootPassword.Length);
        Assert.False(string.IsNullOrWhiteSpace(rootPassword));
    }

    // SSH Key (Đợt 3, Phần 12) - hasSshKey=true không sinh mật khẩu.
    [Fact]
    public void GenerateServerCredentials_HasSshKeyTrue_ReturnsNullPassword()
    {
        var sut = new FakeProvisioningGenerator();

        var (ipAddress, rootPassword) = sut.GenerateServerCredentials(hasSshKey: true);

        Assert.Null(rootPassword);
        Assert.False(string.IsNullOrWhiteSpace(ipAddress));
    }

    [Fact]
    public void GenerateNameservers_ReturnsStaticCloudverseNameservers()
    {
        var sut = new FakeProvisioningGenerator();

        var nameservers = sut.GenerateNameservers();

        Assert.Equal("ns1.cloudverse.vn, ns2.cloudverse.vn", nameservers);
    }
}
