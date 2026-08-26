using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Common.Utils;
using CloudServiceStore.Application.Features.Catalog.ServicePlans.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Catalog.ServicePlans;

public class ServicePlanService : IServicePlanService
{
    private readonly IUnitOfWork _unitOfWork;

    public ServicePlanService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<ServicePlanListItemDto>> GetListAsync(ServicePlanQueryParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<ServicePlan, int>();

        var baseQuery = repository.Query()
            .Include(p => p.Category)
            .Include(p => p.Prices)
            .Include(p => p.Features)
            .Include(p => p.Region)
            .Include(p => p.PlanAddons).ThenInclude(pa => pa.Addon)
            .Include(p => p.PlanOsImages).ThenInclude(pi => pi.OsImage)
            .Where(p => p.Status == ServicePlanStatus.Active
                && (query.CategorySlug == null || p.Category.Slug == query.CategorySlug)
                && (query.IsFeatured == null || p.IsFeatured == query.IsFeatured)
                && (query.RegionId == null || p.RegionId == query.RegionId))
            .OrderBy(p => p.DisplayOrder);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(MapToListItemDto).ToList();
        return PagedResult<ServicePlanListItemDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<ServicePlanDetailDto> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<ServicePlan, int>();

        var entity = await repository.Query()
            .Include(p => p.Category)
            .Include(p => p.Features)
            .Include(p => p.Prices)
            .Include(p => p.Region)
            .Include(p => p.PlanAddons).ThenInclude(pa => pa.Addon)
            .Include(p => p.PlanOsImages).ThenInclude(pi => pi.OsImage)
            .FirstOrDefaultAsync(p => p.Slug == slug && p.Status == ServicePlanStatus.Active, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(ServicePlan), slug);
        }

        return MapToDetailDto(entity);
    }

    private static ServicePlanListItemDto MapToListItemDto(ServicePlan plan)
    {
        var activePrices = plan.Prices.Where(x => x.IsActive && x.IsCurrent).ToList();

        return new ServicePlanListItemDto
        {
            Id = plan.Id,
            Name = plan.Name,
            Slug = plan.Slug,
            ShortDescription = plan.ShortDescription,
            IsFeatured = plan.IsFeatured,
            QrCodeUrl = plan.QrCodeUrl,
            CategoryName = plan.Category.Name,
            CategorySlug = plan.Category.Slug,
            RegionName = plan.Region?.Name,
            StartingPrice = ComputeStartingPrice(plan, activePrices),
            PackageType = plan.PackageType.ToString(),
            MinVcpu = plan.MinVcpu,
            MaxVcpu = plan.MaxVcpu,
            StepVcpu = plan.StepVcpu,
            MinRamMb = plan.MinRamMb,
            MaxRamMb = plan.MaxRamMb,
            StepRamMb = plan.StepRamMb,
            MinDiskGb = plan.MinDiskGb,
            MaxDiskGb = plan.MaxDiskGb,
            StepDiskGb = plan.StepDiskGb,
            PricePerVcpuPerMonth = plan.PricePerVcpuPerMonth,
            PricePerRamGbPerMonth = plan.PricePerRamGbPerMonth,
            PricePerDiskGbPerMonth = plan.PricePerDiskGbPerMonth,
            Features = plan.Features
                .OrderBy(f => f.DisplayOrder)
                .Select(f => new PlanFeatureDto
                {
                    FeatureKey = f.FeatureKey,
                    FeatureLabel = f.FeatureLabel,
                    FeatureValueText = f.FeatureValueText,
                    FeatureValueNumeric = f.FeatureValueNumeric,
                    FeatureUnit = f.FeatureUnit,
                    IsHighlighted = f.IsHighlighted
                })
                .ToList(),
            Prices = activePrices
                .Select(p => new PlanPriceDto
                {
                    PeriodMonths = p.PeriodMonths,
                    Price = p.Price,
                    PromotionalPrice = p.PromotionalPrice,
                    Currency = p.Currency,
                    IsDefault = p.IsDefault,
                    DiscountPercent = p.DiscountPercent
                })
                .ToList(),
            Addons = MapAddons(plan),
            OsImages = MapOsImages(plan)
        };
    }

    // Fixed: giá thấp nhất trong các chu kỳ đang bán (như cũ). Custom: giá ở cấu hình TỐI THIỂU
    // (Min vCPU/RAM/Disk) rẻ nhất trong các chu kỳ - dùng ĐÚNG 1 công thức với lúc tính giá bán thật
    // (CustomPlanPricing), tránh hiển thị 1 giá nhưng lúc mua tính ra giá khác.
    private static decimal? ComputeStartingPrice(ServicePlan plan, List<PlanPrice> activePrices)
    {
        if (activePrices.Count == 0)
        {
            return null;
        }

        if (plan.PackageType != ServicePlanPackageType.Custom)
        {
            return activePrices.Min(x => x.PromotionalPrice ?? x.Price);
        }

        if (plan.MinVcpu is null || plan.MinRamMb is null || plan.MinDiskGb is null)
        {
            return null;
        }

        return activePrices.Min(p => CustomPlanPricing.ComputeUnitPrice(
            plan, plan.MinVcpu.Value, plan.MinRamMb.Value, plan.MinDiskGb.Value, p.PeriodMonths, p.DiscountPercent));
    }

    private static ServicePlanDetailDto MapToDetailDto(ServicePlan plan)
    {
        return new ServicePlanDetailDto
        {
            Id = plan.Id,
            Name = plan.Name,
            Slug = plan.Slug,
            ShortDescription = plan.ShortDescription,
            Description = plan.Description,
            IsFeatured = plan.IsFeatured,
            QrCodeUrl = plan.QrCodeUrl,
            CategoryName = plan.Category.Name,
            CategorySlug = plan.Category.Slug,
            RegionName = plan.Region?.Name,
            PackageType = plan.PackageType.ToString(),
            MinVcpu = plan.MinVcpu,
            MaxVcpu = plan.MaxVcpu,
            StepVcpu = plan.StepVcpu,
            MinRamMb = plan.MinRamMb,
            MaxRamMb = plan.MaxRamMb,
            StepRamMb = plan.StepRamMb,
            MinDiskGb = plan.MinDiskGb,
            MaxDiskGb = plan.MaxDiskGb,
            StepDiskGb = plan.StepDiskGb,
            PricePerVcpuPerMonth = plan.PricePerVcpuPerMonth,
            PricePerRamGbPerMonth = plan.PricePerRamGbPerMonth,
            PricePerDiskGbPerMonth = plan.PricePerDiskGbPerMonth,
            Features = plan.Features
                .OrderBy(f => f.DisplayOrder)
                .Select(f => new PlanFeatureDto
                {
                    FeatureKey = f.FeatureKey,
                    FeatureLabel = f.FeatureLabel,
                    FeatureValueText = f.FeatureValueText,
                    FeatureValueNumeric = f.FeatureValueNumeric,
                    FeatureUnit = f.FeatureUnit,
                    IsHighlighted = f.IsHighlighted
                })
                .ToList(),
            Prices = plan.Prices
                .Where(p => p.IsActive && p.IsCurrent)
                .Select(p => new PlanPriceDto
                {
                    PeriodMonths = p.PeriodMonths,
                    Price = p.Price,
                    PromotionalPrice = p.PromotionalPrice,
                    Currency = p.Currency,
                    IsDefault = p.IsDefault,
                    DiscountPercent = p.DiscountPercent
                })
                .ToList(),
            Addons = MapAddons(plan),
            OsImages = MapOsImages(plan)
        };
    }

    // Chỉ trả addon còn IsActive - khách không thấy addon Admin đã ngừng bán (khác Admin form, Admin
    // cần thấy cả addon đã tắt để biết vì sao 1 gói cũ vẫn còn gắn addon đó).
    private static List<PlanAddonDto> MapAddons(ServicePlan plan) =>
        plan.PlanAddons
            .Where(pa => pa.Addon.IsActive)
            .Select(pa => new PlanAddonDto
            {
                AddonId = pa.AddonId,
                AddonName = pa.Addon.Name,
                Type = pa.Addon.Type.ToString(),
                BillingType = pa.Addon.BillingType.ToString(),
                UnitName = pa.Addon.UnitName,
                PricePerMonth = pa.Addon.PricePerMonth,
                MaxQuantity = pa.MaxQuantity
            })
            .ToList();

    // Chỉ trả OS còn IsActive - mirror MapAddons.
    private static List<PlanOsImageDto> MapOsImages(ServicePlan plan) =>
        plan.PlanOsImages
            .Where(pi => pi.OsImage.IsActive)
            .Select(pi => new PlanOsImageDto
            {
                OsImageId = pi.OsImageId,
                OsImageName = pi.OsImage.Name,
                Family = pi.OsImage.Family.ToString(),
                WindowsLicenseFeePerMonth = pi.OsImage.WindowsLicenseFeePerMonth,
                IsDefault = pi.IsDefault
            })
            .ToList();
}
