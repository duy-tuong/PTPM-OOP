using CloudServiceStore.Application.Features.Content.NewsCategories;
using CloudServiceStore.Application.Features.Content.NewsCategories.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/news-categories")]
public class NewsCategoriesController : ControllerBase
{
    private readonly INewsCategoryService _service;

    public NewsCategoriesController(INewsCategoryService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<NewsCategoryDto>>> GetList(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(cancellationToken));
    }
}
