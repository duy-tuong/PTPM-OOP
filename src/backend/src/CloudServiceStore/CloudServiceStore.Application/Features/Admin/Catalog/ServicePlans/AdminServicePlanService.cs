using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Admin.Catalog.ServicePlans.Dtos;
using CloudServiceStore.Application.Features.Catalog.ServicePlans.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Catalog.ServicePlans;

public class AdminServicePlanService : IAdminServicePlanService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IQrCodeFactory _qrCodeFactory;

    public AdminServicePlanService(IUnitOfWork unitOfWork, IQrCodeFactory qrCodeFactory)
    {
        _unitOfWork = unitOfWork;
        _qrCodeFactory = qrCodeFactory;
    }

    public async Task<AdminServicePlanDto> CreateAsync(CreateServicePlanDto dto, CancellationToken cancellationToken = default)
    {
        var planRepository = _unitOfWork.Repository<ServicePlan, int>();

        await EnsureCategoryExistsAsync(dto.CategoryId, cancellationToken);
        await EnsureSlugIsUniqueAsync(planRepository, dto.Slug, excludeId: null, cancellationToken);

        var plan = new ServicePlan
        {
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Slug = dto.Slug,
            ShortDescription = dto.ShortDescription,
            Description = dto.Description,
            IsFeatured = dto.IsFeatured,
            IsActive = dto.IsActive,
            DisplayOrder = dto.DisplayOrder,
            // Factory Method: sinh QR ngay lúc tạo — QR chỉ encode theo Slug nên không cần chờ Id.
            QrCodeUrl = _qrCodeFactory.GenerateForServicePlan(0, dto.Slug),
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
            Features = dto.Features.Select(f => new PlanFeature
            {
                FeatureKey = f.FeatureKey,
                FeatureLabel = f.FeatureLabel,
                FeatureValueText = f.FeatureValueText,
                FeatureValueNumeric = f.FeatureValueNumeric,
                FeatureUnit = f.FeatureUnit,
                DisplayOrder = f.DisplayOrder,
                IsHighlighted = f.IsHighlighted
            }).ToList(),
            Prices = dto.Prices.Select(p => new PlanPrice
            {
                PeriodMonths = p.PeriodMonths,
                Price = p.Price,
                PromotionalPrice = p.PromotionalPrice,
                Currency = p.Currency,
                IsDefault = p.IsDefault,
                IsActive = p.IsActive,
                CreatedAt = DateTime.UtcNow
            }).ToList()
        };

        // AddAsync trên aggregate root sẽ cascade thêm luôn Features/Prices trong 1 lần SaveChanges
        // (EF Core tự gán PlanId qua relationship fixup) — không cần lưu 2 lần.
        await planRepository.AddAsync(plan, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(plan);
    }

    public async Task<AdminServicePlanDto> UpdateAsync(int id, UpdateServicePlanDto dto, CancellationToken cancellationToken = default)
    {
        var planRepository = _unitOfWork.Repository<ServicePlan, int>();

        var entity = await planRepository.Query()
            .Include(p => p.Features)
            .Include(p => p.Prices)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(ServicePlan), id);
        }

        await EnsureCategoryExistsAsync(dto.CategoryId, cancellationToken);
        await EnsureSlugIsUniqueAsync(planRepository, dto.Slug, excludeId: id, cancellationToken);

        entity.CategoryId = dto.CategoryId;
        entity.Name = dto.Name;
        entity.Slug = dto.Slug;
        entity.ShortDescription = dto.ShortDescription;
        entity.Description = dto.Description;
        entity.IsFeatured = dto.IsFeatured;
        entity.IsActive = dto.IsActive;
        entity.DisplayOrder = dto.DisplayOrder;
        // "kèm sinh lại mã QR" (mục 3.2.3 đề bài) — regenerate mỗi lần Admin sửa gói.
        entity.QrCodeUrl = _qrCodeFactory.GenerateForServicePlan(entity.Id, entity.Slug);
        entity.UpdatedAt = DateTime.UtcNow;

        // Xoá sạch rồi thêm lại Features/Prices — quan hệ PlanId là required nên EF Core tự động
        // xoá (orphan delete) các dòng bị gỡ khỏi collection khi SaveChanges, không cần Remove thủ công.
        entity.Features.Clear();
        foreach (var f in dto.Features)
        {
            entity.Features.Add(new PlanFeature
            {
                FeatureKey = f.FeatureKey,
                FeatureLabel = f.FeatureLabel,
                FeatureValueText = f.FeatureValueText,
                FeatureValueNumeric = f.FeatureValueNumeric,
                FeatureUnit = f.FeatureUnit,
                DisplayOrder = f.DisplayOrder,
                IsHighlighted = f.IsHighlighted
            });
        }

        entity.Prices.Clear();
        foreach (var p in dto.Prices)
        {
            entity.Prices.Add(new PlanPrice
            {
                PeriodMonths = p.PeriodMonths,
                Price = p.Price,
                PromotionalPrice = p.PromotionalPrice,
                Currency = p.Currency,
                IsDefault = p.IsDefault,
                IsActive = p.IsActive,
                CreatedAt = DateTime.UtcNow
            });
        }

        planRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var planRepository = _unitOfWork.Repository<ServicePlan, int>();

        var entity = await planRepository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(ServicePlan), id);
        }

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;

        planRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureCategoryExistsAsync(int categoryId, CancellationToken cancellationToken)
    {
        var categoryRepository = _unitOfWork.Repository<ServiceCategory, int>();
        var category = await categoryRepository.GetByIdAsync(categoryId, cancellationToken);
        if (category is null)
        {
            throw new NotFoundException(nameof(ServiceCategory), categoryId);
        }
    }

    private static async Task EnsureSlugIsUniqueAsync(
        IRepository<ServicePlan, int> repository,
        string slug,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var isDuplicate = await repository.Query()
            .AnyAsync(p => p.Slug == slug && p.Id != (excludeId ?? 0), cancellationToken);

        if (isDuplicate)
        {
            throw new ConflictException($"Slug '{slug}' đã tồn tại.");
        }
    }

    private static AdminServicePlanDto MapToDto(ServicePlan plan)
    {
        return new AdminServicePlanDto
        {
            Id = plan.Id,
            CategoryId = plan.CategoryId,
            Name = plan.Name,
            Slug = plan.Slug,
            ShortDescription = plan.ShortDescription,
            Description = plan.Description,
            IsFeatured = plan.IsFeatured,
            IsActive = plan.IsActive,
            DisplayOrder = plan.DisplayOrder,
            QrCodeUrl = plan.QrCodeUrl,
            Features = plan.Features.Select(f => new PlanFeatureDto
            {
                FeatureKey = f.FeatureKey,
                FeatureLabel = f.FeatureLabel,
                FeatureValueText = f.FeatureValueText,
                FeatureValueNumeric = f.FeatureValueNumeric,
                FeatureUnit = f.FeatureUnit,
                IsHighlighted = f.IsHighlighted
            }).ToList(),
            Prices = plan.Prices.Select(p => new PlanPriceDto
            {
                PeriodMonths = p.PeriodMonths,
                Price = p.Price,
                PromotionalPrice = p.PromotionalPrice,
                Currency = p.Currency,
                IsDefault = p.IsDefault
            }).ToList()
        };
    }
}
