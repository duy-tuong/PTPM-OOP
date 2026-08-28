using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Content.NewsComments.Dtos;
using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Content.NewsComments;

public class AdminNewsCommentService : IAdminNewsCommentService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminNewsCommentService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<AdminNewsCommentDto>> GetListAsync(NewsCommentQueryParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<NewsComment, int>();

        var baseQuery = repository.Query()
            .Include(c => c.NewsArticle)
            .Include(c => c.Customer)
            .Where(c => query.NewsArticleId == null || c.NewsArticleId == query.NewsArticleId)
            .Where(c => query.IsApproved == null || c.IsApproved == query.IsApproved)
            .Where(c => query.Search == null || c.Content.Contains(query.Search)
                || (c.AuthorName != null && c.AuthorName.Contains(query.Search))
                || (c.Customer != null && c.Customer.FullName.Contains(query.Search)))
            .OrderByDescending(c => c.CreatedAt);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(MapToDto).ToList();
        return PagedResult<AdminNewsCommentDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<AdminNewsCommentDto> UpdateApprovalAsync(int id, UpdateNewsCommentApprovalDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<NewsComment, int>();

        var entity = await repository.Query()
            .Include(c => c.NewsArticle)
            .Include(c => c.Customer)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(NewsComment), id);
        }

        entity.IsApproved = dto.IsApproved;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<NewsComment, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(NewsComment), id);
        }

        // ParentCommentId dùng DeleteBehavior.Restrict (self-FK) - xoá thẳng 1 bình luận đang có phản hồi
        // sẽ vỡ ràng buộc khoá ngoại ở DB, nên chặn sớm ở đây với thông báo rõ ràng cho Admin.
        var hasReplies = await repository.Query().AnyAsync(c => c.ParentCommentId == id, cancellationToken);
        if (hasReplies)
        {
            throw new ConflictException("Không thể xoá bình luận đang có phản hồi.");
        }

        repository.Remove(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static AdminNewsCommentDto MapToDto(NewsComment comment)
    {
        return new AdminNewsCommentDto
        {
            Id = comment.Id,
            NewsArticleId = comment.NewsArticleId,
            NewsArticleTitle = comment.NewsArticle.Title,
            ParentCommentId = comment.ParentCommentId,
            AuthorDisplayName = comment.Customer?.FullName ?? comment.AuthorName ?? "Ẩn danh",
            AuthorEmail = comment.CustomerId == null ? comment.AuthorEmail : null,
            Content = comment.Content,
            IsApproved = comment.IsApproved,
            CreatedAt = comment.CreatedAt
        };
    }
}
