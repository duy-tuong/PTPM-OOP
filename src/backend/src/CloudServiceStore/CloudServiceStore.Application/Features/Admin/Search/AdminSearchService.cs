using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Admin.Search.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Content;
using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Domain.Entities.Marketing;
using CloudServiceStore.Domain.Entities.Sales;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Search;

public class AdminSearchService : IAdminSearchService
{
    // Top N mỗi nhóm - đây là ô tìm kiếm nhanh để nhảy trang, không phải trang danh sách đầy đủ (đã có
    // ô tìm kiếm + phân trang riêng cho từng trang quản lý), quá nhiều kết quả sẽ khó quét bằng mắt.
    private const int MaxResultsPerGroup = 5;
    private const int MinQueryLength = 2;

    private readonly IUnitOfWork _unitOfWork;

    public AdminSearchService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<AdminSearchResultDto> SearchAsync(string query, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var result = new AdminSearchResultDto();

        var trimmed = query?.Trim() ?? string.Empty;
        if (trimmed.Length < MinQueryLength)
        {
            // Từ khoá quá ngắn (0-1 ký tự) sẽ khớp gần như mọi bản ghi ở mọi bảng - trả rỗng thay vì
            // quét/hiện 1 danh sách vô nghĩa, đúng hành vi UX chuẩn của command palette.
            return result;
        }

        // Các entity Admin-only (đúng ranh giới quyền của AdminCustomersController/AdminUsersController/
        // AdminServicePlansController/AdminPromotionsController - xem [Authorize] ở từng controller) chỉ
        // chạy khi caller là Admin, tránh Editor thấy dữ liệu họ không có quyền xem qua trang riêng.
        if (isAdmin)
        {
            result.Customers = await SearchCustomersAsync(trimmed, cancellationToken);
            result.Users = await SearchUsersAsync(trimmed, cancellationToken);
            result.ServicePlans = await SearchServicePlansAsync(trimmed, cancellationToken);
            result.Promotions = await SearchPromotionsAsync(trimmed, cancellationToken);
        }

        // Admin+Editor - khớp đúng ranh giới quyền của AdminOrderRequestsController/
        // AdminConsultationRequestsController/AdminNewsArticlesController (class-level Admin,Editor).
        result.OrderRequests = await SearchOrderRequestsAsync(trimmed, cancellationToken);
        result.ConsultationRequests = await SearchConsultationRequestsAsync(trimmed, cancellationToken);
        result.NewsArticles = await SearchNewsArticlesAsync(trimmed, cancellationToken);

        return result;
    }

    private async Task<List<AdminSearchResultItemDto>> SearchCustomersAsync(string q, CancellationToken ct)
    {
        var entities = await _unitOfWork.Repository<Customer, Guid>().Query()
            .Where(c => c.FullName.Contains(q) || c.Email.Contains(q))
            .OrderBy(c => c.FullName)
            .Take(MaxResultsPerGroup)
            .ToListAsync(ct);

        return entities.Select(c => new AdminSearchResultItemDto
        {
            Id = c.Id.ToString(),
            Title = c.FullName,
            Subtitle = c.Email,
            Url = $"/admin/customers/{c.Id}",
        }).ToList();
    }

    private async Task<List<AdminSearchResultItemDto>> SearchUsersAsync(string q, CancellationToken ct)
    {
        var entities = await _unitOfWork.Repository<AppUser, Guid>().Query()
            .Where(u => u.Username.Contains(q) || u.Email.Contains(q) || u.FullName.Contains(q))
            .OrderBy(u => u.Username)
            .Take(MaxResultsPerGroup)
            .ToListAsync(ct);

        return entities.Select(u => new AdminSearchResultItemDto
        {
            Id = u.Id.ToString(),
            Title = u.FullName,
            Subtitle = u.Username,
            Url = $"/admin/users?search={Uri.EscapeDataString(u.Username)}",
        }).ToList();
    }

    private async Task<List<AdminSearchResultItemDto>> SearchServicePlansAsync(string q, CancellationToken ct)
    {
        var entities = await _unitOfWork.Repository<ServicePlan, int>().Query()
            .Where(p => p.Name.Contains(q) || p.Slug.Contains(q) || (p.Sku != null && p.Sku.Contains(q)))
            .OrderBy(p => p.Name)
            .Take(MaxResultsPerGroup)
            .ToListAsync(ct);

        return entities.Select(p => new AdminSearchResultItemDto
        {
            Id = p.Id.ToString(),
            Title = p.Name,
            Subtitle = p.Slug,
            Url = $"/admin/service-plans/{p.Id}/edit",
        }).ToList();
    }

    private async Task<List<AdminSearchResultItemDto>> SearchPromotionsAsync(string q, CancellationToken ct)
    {
        var entities = await _unitOfWork.Repository<Promotion, int>().Query()
            .Where(p => p.Code.Contains(q) || p.Name.Contains(q))
            .OrderByDescending(p => p.StartDate)
            .Take(MaxResultsPerGroup)
            .ToListAsync(ct);

        return entities.Select(p => new AdminSearchResultItemDto
        {
            Id = p.Id.ToString(),
            Title = p.Code,
            Subtitle = p.Name,
            Url = $"/admin/promotions?search={Uri.EscapeDataString(p.Code)}",
        }).ToList();
    }

    private async Task<List<AdminSearchResultItemDto>> SearchOrderRequestsAsync(string q, CancellationToken ct)
    {
        var entities = await _unitOfWork.Repository<OrderRequest, int>().Query()
            .Where(o => o.OrderCode.Contains(q) || o.CustomerName.Contains(q) || o.CustomerEmail.Contains(q))
            .OrderByDescending(o => o.CreatedAt)
            .Take(MaxResultsPerGroup)
            .ToListAsync(ct);

        return entities.Select(o => new AdminSearchResultItemDto
        {
            Id = o.Id.ToString(),
            Title = o.OrderCode,
            Subtitle = o.CustomerName,
            Url = $"/admin/order-requests?search={Uri.EscapeDataString(o.OrderCode)}",
        }).ToList();
    }

    private async Task<List<AdminSearchResultItemDto>> SearchConsultationRequestsAsync(string q, CancellationToken ct)
    {
        var entities = await _unitOfWork.Repository<ConsultationRequest, int>().Query()
            .Where(c => c.RequestCode.Contains(q) || c.FullName.Contains(q) || c.Email.Contains(q))
            .OrderByDescending(c => c.CreatedAt)
            .Take(MaxResultsPerGroup)
            .ToListAsync(ct);

        return entities.Select(c => new AdminSearchResultItemDto
        {
            Id = c.Id.ToString(),
            Title = c.RequestCode,
            Subtitle = c.FullName,
            Url = $"/admin/consultation-requests?search={Uri.EscapeDataString(c.RequestCode)}",
        }).ToList();
    }

    private async Task<List<AdminSearchResultItemDto>> SearchNewsArticlesAsync(string q, CancellationToken ct)
    {
        var entities = await _unitOfWork.Repository<NewsArticle, int>().Query()
            .Where(a => a.Title.Contains(q) || a.Slug.Contains(q))
            .OrderByDescending(a => a.PublishedAt)
            .Take(MaxResultsPerGroup)
            .ToListAsync(ct);

        return entities.Select(a => new AdminSearchResultItemDto
        {
            Id = a.Id.ToString(),
            Title = a.Title,
            Subtitle = a.Slug,
            Url = $"/admin/news-articles/{a.Id}/edit",
        }).ToList();
    }
}
