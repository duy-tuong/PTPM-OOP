using CloudServiceStore.Infrastructure.Security;

namespace CloudServiceStore.Tests.Infrastructure.Security;

public class BCryptPasswordHasherTests
{
    private readonly BCryptPasswordHasher _sut = new();

    [Fact]
    public void Hash_ThenVerify_SamePassword_ReturnsTrue()
    {
        var hash = _sut.Hash("Admin@123");

        var result = _sut.Verify("Admin@123", hash);

        Assert.True(result);
    }

    [Fact]
    public void Verify_WrongPassword_ReturnsFalse()
    {
        var hash = _sut.Hash("Admin@123");

        var result = _sut.Verify("WrongPassword", hash);

        Assert.False(result);
    }

    [Fact]
    public void Hash_SameInputTwice_ProducesDifferentHashes_DueToSalt()
    {
        var hash1 = _sut.Hash("Admin@123");
        var hash2 = _sut.Hash("Admin@123");

        Assert.NotEqual(hash1, hash2);
    }
}
