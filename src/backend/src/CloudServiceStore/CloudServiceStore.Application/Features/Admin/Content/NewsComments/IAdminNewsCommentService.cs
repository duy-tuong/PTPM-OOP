using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Content.NewsComments.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Content.NewsComments;

public interface IAdminNewsCommentService
{
    Task<PagedResult<AdminNewsCommentDto>> GetListAsync(NewsCommentQueryParams query, CancellationToken cancellationToken = default);

    Task<AdminNewsCommentDto> UpdateApprovalAsync(int id, UpdateNewsCommentApprovalDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
