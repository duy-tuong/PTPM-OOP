using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Content.NewsComments.Dtos;
using CloudServiceStore.Domain.Entities.Content;
using CloudServiceStore.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Content.NewsComments;

public class NewsCommentService : INewsCommentService
{
    private readonly IUnitOfWork _unitOfWork;

    public NewsCommentService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<NewsCommentDto>> GetForArticleAsync(int newsArticleId, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<NewsComment, int>();

        var comments = await repository.Query()
            .Include(c => c.Customer)
            .Where(c => c.NewsArticleId == newsArticleId && c.IsApproved)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync(cancellationToken);

        var lookup = comments.ToLookup(c => c.ParentCommentId);
        return BuildTree(null, lookup);
    }

    public async Task<NewsCommentDto> CreateAsync(CreateNewsCommentDto dto, Guid? customerId, CancellationToken cancellationToken = default)
    {
        var articleRepository = _unitOfWork.Repository<NewsArticle, int>();
        var articleExists = await articleRepository.Query().AnyAsync(a => a.Id == dto.NewsArticleId, cancellationToken);
        if (!articleExists)
        {
            throw new NotFoundException(nameof(NewsArticle), dto.NewsArticleId);
        }

        var commentRepository = _unitOfWork.Repository<NewsComment, int>();

        if (dto.ParentCommentId is not null)
        {
            var parentExists = await commentRepository.Query()
                .AnyAsync(c => c.Id == dto.ParentCommentId && c.NewsArticleId == dto.NewsArticleId, cancellationToken);
            if (!parentExists)
            {
                throw new NotFoundException(nameof(NewsComment), dto.ParentCommentId);
            }
        }

        Customer? customer = null;
        if (customerId is not null)
        {
            var customerRepository = _unitOfWork.Repository<Customer, Guid>();
            customer = await customerRepository.GetByIdAsync(customerId.Value, cancellationToken);
        }

        // Khách đã đăng nhập: bỏ qua AuthorName/AuthorEmail client gửi lên, lấy tên thật từ Customer -
        // chống giả mạo danh tính. Khách vãng lai: bắt buộc phải tự nhập tên (không validate được gọn
        // bằng DataAnnotations vì "required" ở đây phụ thuộc trạng thái đăng nhập).
        if (customer is null && string.IsNullOrWhiteSpace(dto.AuthorName))
        {
            throw new ConflictException("Vui lòng nhập tên của bạn.");
        }

        var comment = new NewsComment
        {
            NewsArticleId = dto.NewsArticleId,
            ParentCommentId = dto.ParentCommentId,
            CustomerId = customer?.Id,
            AuthorName = customer is null ? dto.AuthorName : null,
            AuthorEmail = customer is null ? dto.AuthorEmail : null,
            Content = dto.Content,
            IsApproved = false,
            CreatedAt = DateTime.UtcNow,
        };

        await commentRepository.AddAsync(comment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new NewsCommentDto
        {
            Id = comment.Id,
            ParentCommentId = comment.ParentCommentId,
            AuthorDisplayName = customer?.FullName ?? dto.AuthorName ?? "Ẩn danh",
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            Replies = new List<NewsCommentDto>(),
        };
    }

    private static List<NewsCommentDto> BuildTree(int? parentId, ILookup<int?, NewsComment> lookup)
    {
        return lookup[parentId]
            .Select(c => new NewsCommentDto
            {
                Id = c.Id,
                ParentCommentId = c.ParentCommentId,
                AuthorDisplayName = c.Customer?.FullName ?? c.AuthorName ?? "Ẩn danh",
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                Replies = BuildTree(c.Id, lookup),
            })
            .ToList();
    }
}
