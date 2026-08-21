namespace CloudServiceStore.Application.Common.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<TEntity, TKey> Repository<TEntity, TKey>() where TEntity : class;

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
