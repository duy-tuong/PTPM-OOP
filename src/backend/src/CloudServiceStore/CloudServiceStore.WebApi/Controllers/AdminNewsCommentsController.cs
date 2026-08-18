using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Content.NewsComments;
using CloudServiceStore.Application.Features.Admin.Content.NewsComments.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/news-comments")]
[Authorize(Roles = "Admin,Editor")]
public class AdminNewsCommentsController : ControllerBase
{
    private readonly IAdminNewsCommentService _service;

    public AdminNewsCommentsController(IAdminNewsCommentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminNewsCommentDto>>> GetList([FromQuery] NewsCommentQueryParams query, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(query, cancellationToken));
    }

    [HttpPut("{id:int}/approval")]
    public async Task<ActionResult<AdminNewsCommentDto>> UpdateApproval(int id, UpdateNewsCommentApprovalDto dto, CancellationToken cancellationToken)
    {
        return Ok(await _service.UpdateApprovalAsync(id, dto, cancellationToken));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _service.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
