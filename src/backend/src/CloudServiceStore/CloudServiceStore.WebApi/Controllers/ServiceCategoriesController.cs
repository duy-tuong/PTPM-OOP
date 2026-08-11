using CloudServiceStore.Application.Features.Catalog.ServiceCategories;
using CloudServiceStore.Application.Features.Catalog.ServiceCategories.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/service-categories")]
public class ServiceCategoriesController : ControllerBase
{
    private readonly IServiceCategoryService _service;

    public ServiceCategoriesController(IServiceCategoryService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<ServiceCategoryDto>>> GetList(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(cancellationToken));
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<ServiceCategoryDto>> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetBySlugAsync(slug, cancellationToken));
    }
}
