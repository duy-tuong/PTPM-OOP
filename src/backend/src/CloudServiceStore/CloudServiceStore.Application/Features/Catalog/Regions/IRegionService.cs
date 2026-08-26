using CloudServiceStore.Application.Features.Catalog.Regions.Dtos;

namespace CloudServiceStore.Application.Features.Catalog.Regions;

public interface IRegionService
{
    Task<List<RegionDto>> GetListAsync(CancellationToken cancellationToken = default);
}
