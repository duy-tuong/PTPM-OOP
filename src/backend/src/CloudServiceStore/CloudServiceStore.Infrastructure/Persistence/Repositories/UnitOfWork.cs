using CloudServiceStore.Application.Common.Interfaces;

namespace CloudServiceStore.Infrastructure.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    private readonly Dictionary<Type, object> _repositories = new();
    private bool _disposed;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    public IRepository<TEntity, TKey> Repository<TEntity, TKey>() where TEntity : class
    {
        var entityType = typeof(TEntity);

        if (_repositories.TryGetValue(entityType, out var existing))
        {
            return (IRepository<TEntity, TKey>)existing;
        }

        var repository = new Repository<TEntity, TKey>(_context);
        _repositories[entityType] = repository;
        return repository;
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => _context.SaveChangesAsync(cancellationToken);

    public void Dispose()
    {
        if (_disposed) return;
        _context.Dispose();
        _disposed = true;
        GC.SuppressFinalize(this);
    }
}
