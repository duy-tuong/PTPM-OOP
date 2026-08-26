using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Identity.Customers;
using CloudServiceStore.Application.Features.Admin.Identity.Customers.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/customers")]
[Authorize(Roles = "Admin")]
public class AdminCustomersController : ControllerBase
{
    private readonly IAdminCustomerService _service;

    public AdminCustomersController(IAdminCustomerService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminCustomerDto>>> GetList([FromQuery] CustomerQueryParams query, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(query, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdminCustomerDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetByIdAsync(id, cancellationToken));
    }

    [HttpPut("{id:guid}/status")]
    public async Task<ActionResult<AdminCustomerDto>> UpdateActiveStatus(Guid id, UpdateCustomerActiveStatusDto dto, CancellationToken cancellationToken)
    {
        return Ok(await _service.UpdateActiveStatusAsync(id, dto, cancellationToken));
    }

    // CRM: Hồ sơ B2B & Sales Rep (Đợt 2, Phần 10).
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<AdminCustomerDto>> Update(Guid id, UpdateCustomerDto dto, CancellationToken cancellationToken)
    {
        return Ok(await _service.UpdateAsync(id, dto, cancellationToken));
    }
}
