using CloudServiceStore.Application.Common.Interfaces;
using BC = BCrypt.Net.BCrypt;

namespace CloudServiceStore.Infrastructure.Security;

public class BCryptPasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 12;

    public string Hash(string password) => BC.HashPassword(password, WorkFactor);

    public bool Verify(string password, string hash) => BC.Verify(password, hash);
}
