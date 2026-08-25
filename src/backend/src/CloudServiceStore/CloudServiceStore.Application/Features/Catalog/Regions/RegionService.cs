using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Catalog.Regions.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Catalog.Regions;

public class RegionService : IRegionService
{
    private readonly IUnitOfWork _unitOfWork;

    public RegionService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<RegionDto>> GetListAsync(CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Region, string>();

        var entities = await repository.Query()
            .Where(r => r.IsActive)
            .OrderBy(r => r.Name)
            .ToListAsync(cancellationToken);

        return entities.Select(r => new RegionDto
        {
            Id = r.Id,
            Name = r.Name,
            City = r.City,
            CountryCode = r.CountryCode
        }).ToList();
    }
}
