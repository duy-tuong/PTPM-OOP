using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Admin.Marketing.Promotions.Dtos;
using CloudServiceStore.Domain.Entities.Marketing;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Marketing.Promotions;

public class AdminPromotionService : IAdminPromotionService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminPromotionService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<AdminPromotionDto>> GetListAsync(CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Promotion, int>();

        var entities = await repository.Query()
            .Include(p => p.Scopes).ThenInclude(s => s.ServiceCategory)
            .Include(p => p.Scopes).ThenInclude(s => s.ServicePlan)
            .OrderByDescending(p => p.StartDate)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto).ToList();
    }

    public async Task<AdminPromotionDto> CreateAsync(CreatePromotionDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Promotion, int>();

        await EnsureCodeIsUniqueAsync(repository, dto.Code, excludeId: null, cancellationToken);

        var entity = new Promotion
        {
            Code = dto.Code,
            Name = dto.Name,
            Description = dto.Description,
            DiscountType = dto.DiscountType,
            DiscountValue = dto.DiscountValue,
            MaxDiscountAmount = dto.MaxDiscountAmount,
            MinOrderValue = dto.MinOrderValue,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            UsageLimit = dto.UsageLimit,
            UsageCount = 0,
            IsActive = dto.IsActive,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow
        };

        ApplyScopes(entity, dto.Scopes);

        await repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetByIdWithScopesAsync(repository, entity.Id, cancellationToken);
    }

    public async Task<AdminPromotionDto> UpdateAsync(int id, UpdatePromotionDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Promotion, int>();

        var entity = await repository.Query()
            .Include(p => p.Scopes)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(Promotion), id);
        }

        await EnsureCodeIsUniqueAsync(repository, dto.Code, excludeId: id, cancellationToken);

        entity.Code = dto.Code;
        entity.Name = dto.Name;
        entity.Description = dto.Description;
        entity.DiscountType = dto.DiscountType;
        entity.DiscountValue = dto.DiscountValue;
        entity.MaxDiscountAmount = dto.MaxDiscountAmount;
        entity.MinOrderValue = dto.MinOrderValue;
        entity.StartDate = dto.StartDate;
        entity.EndDate = dto.EndDate;
        entity.UsageLimit = dto.UsageLimit;
        entity.IsActive = dto.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        ApplyScopes(entity, dto.Scopes);

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetByIdWithScopesAsync(repository, entity.Id, cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Promotion, int>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(Promotion), id);
        }

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    // Sau khi SaveChangesAsync, entity vừa lưu chỉ có FK id trên các PromotionScope mới thêm, chưa có
    // navigation ServiceCategory/ServicePlan để map tên hiển thị - phải query lại kèm Include mới
    // MapToDto ra đúng ServiceCategoryName/ServicePlanName, nếu không response sẽ trả tên rỗng dù DB
    // đã lưu đúng FK.
    private static async Task<AdminPromotionDto> GetByIdWithScopesAsync(
        IRepository<Promotion, int> repository,
        int id,
        CancellationToken cancellationToken)
    {
        var entity = await repository.Query()
            .Include(p => p.Scopes).ThenInclude(s => s.ServiceCategory)
            .Include(p => p.Scopes).ThenInclude(s => s.ServicePlan)
            .FirstAsync(p => p.Id == id, cancellationToken);

        return MapToDto(entity);
    }

    // Full-replace Scopes (mirror AdminServicePlanService dùng cho Features/Prices) - validate trước,
    // Clear() rồi add lại từ danh sách gửi lên, chỉ set FK id theo đúng ScopeType (không set navigation
    // object, không cần thiết vì Update sẽ requery lại ở GetByIdWithScopesAsync).
    private static void ApplyScopes(Promotion entity, List<PromotionScopeInputDto> scopes)
    {
        ValidateScopes(scopes);

        entity.Scopes.Clear();
        foreach (var scope in scopes)
        {
            entity.Scopes.Add(new PromotionScope
            {
                ScopeType = scope.ScopeType,
                ServiceCategoryId = scope.ScopeType == ScopeType.Category ? scope.ServiceCategoryId : null,
                ServicePlanId = scope.ScopeType == ScopeType.Plan ? scope.ServicePlanId : null
            });
        }
    }

    private static void ValidateScopes(List<PromotionScopeInputDto> scopes)
    {
        if (scopes.Any(s => s.ScopeType == ScopeType.All) && scopes.Count > 1)
        {
            throw new ValidationException("Không thể kết hợp phạm vi 'Toàn bộ' với phạm vi khác.");
        }

        foreach (var scope in scopes)
        {
            if (scope.ScopeType == ScopeType.Category && scope.ServiceCategoryId is null)
            {
                throw new ValidationException("Vui lòng chọn danh mục cho phạm vi 'Theo danh mục'.");
            }

            if (scope.ScopeType == ScopeType.Plan && scope.ServicePlanId is null)
            {
                throw new ValidationException("Vui lòng chọn gói dịch vụ cho phạm vi 'Theo gói'.");
            }
        }
    }

    private static async Task EnsureCodeIsUniqueAsync(
        IRepository<Promotion, int> repository,
        string code,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var isDuplicate = await repository.Query()
            .AnyAsync(p => p.Code == code && p.Id != (excludeId ?? 0), cancellationToken);

        if (isDuplicate)
        {
            throw new ConflictException($"Mã khuyến mãi '{code}' đã tồn tại.");
        }
    }

    private static AdminPromotionDto MapToDto(Promotion promotion)
    {
        return new AdminPromotionDto
        {
            Id = promotion.Id,
            Code = promotion.Code,
            Name = promotion.Name,
            Description = promotion.Description,
            DiscountType = promotion.DiscountType.ToString(),
            DiscountValue = promotion.DiscountValue,
            MaxDiscountAmount = promotion.MaxDiscountAmount,
            MinOrderValue = promotion.MinOrderValue,
            StartDate = promotion.StartDate,
            EndDate = promotion.EndDate,
            UsageLimit = promotion.UsageLimit,
            UsageCount = promotion.UsageCount,
            IsActive = promotion.IsActive,
            Scopes = promotion.Scopes.Select(s => new PromotionScopeDto
            {
                ScopeType = s.ScopeType.ToString(),
                ServiceCategoryId = s.ServiceCategoryId,
                ServiceCategoryName = s.ServiceCategory?.Name,
                ServicePlanId = s.ServicePlanId,
                ServicePlanName = s.ServicePlan?.Name
            }).ToList()
        };
    }
}
