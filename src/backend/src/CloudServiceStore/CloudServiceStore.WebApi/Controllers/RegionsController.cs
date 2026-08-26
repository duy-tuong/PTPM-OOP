using CloudServiceStore.Application.Features.Catalog.Regions;
using CloudServiceStore.Application.Features.Catalog.Regions.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

// Danh sách cố định nhỏ (3 Region trang trí, xem Region.cs) - chỉ 1 endpoint đọc, không cần CRUD Admin
// riêng trong đợt này. Dùng cho cả select ở ServicePlanForm.tsx (Admin) và filter/badge ở storefront.
[ApiController]
[Route("api/regions")]
public class RegionsController : ControllerBase
{
    private readonly IRegionService _service;

    public RegionsController(IRegionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<RegionDto>>> GetList(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(cancellationToken));
    }
}
