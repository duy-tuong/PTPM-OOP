using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Tests.TestHelpers;

// Tạo AppDbContext/UnitOfWork thật chạy trên EF Core InMemory provider (thay vì mock IRepository/IUnitOfWork)
// để các service dùng repository.Query().Include(...).FirstOrDefaultAsync/AnyAsync/... chạy đúng
// (List<T>.AsQueryable() không hỗ trợ IAsyncQueryProvider nên Moq thuần không dùng được cho các trường hợp này).
public static class TestDbContextFactory
{
    public static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    public static UnitOfWork CreateUnitOfWork(AppDbContext context) => new(context);
}
