using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Catalog.ServicePlans.Dtos;
using CloudServiceStore.Application.Features.Catalog.ServicePlans.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Enums;
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

    // Không ép cứng lọc theo 1 Status (khác bản public ServicePlanService luôn chỉ trả Active) — Admin
    // cần thấy mọi trạng thái (kể cả Draft/Archived) để quản lý; query.Status khi có thì lọc đúng 1
    // trạng thái Admin chọn trên bộ lọc.
    public async Task<PagedResult<AdminServicePlanDto>> GetListAsync(ServicePlanQueryParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<ServicePlan, int>();

        var baseQuery = repository.Query()
            .Include(p => p.Features)
            .Include(p => p.Prices)
            .Include(p => p.Region)
            .Include(p => p.PlanAddons).ThenInclude(pa => pa.Addon)
            .Where(p => (query.CategorySlug == null || p.Category.Slug == query.CategorySlug)
                && (query.IsFeatured == null || p.IsFeatured == query.IsFeatured)
                && (query.Status == null || p.Status == query.Status)
                && (query.RegionId == null || p.RegionId == query.RegionId))
            .OrderBy(p => p.DisplayOrder);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(MapToDto).ToList();
        return PagedResult<AdminServicePlanDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<AdminServicePlanDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<ServicePlan, int>();

        var entity = await repository.Query()
            .Include(p => p.Features)
            .Include(p => p.Prices)
            .Include(p => p.Region)
            .Include(p => p.PlanAddons).ThenInclude(pa => pa.Addon)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(ServicePlan), id);
        }

        return MapToDto(entity);
    }

    public async Task<AdminServicePlanDto> CreateAsync(CreateServicePlanDto dto, CancellationToken cancellationToken = default)
    {
        var planRepository = _unitOfWork.Repository<ServicePlan, int>();

        await EnsureCategoryExistsAsync(dto.CategoryId, cancellationToken);
        await EnsureSlugIsUniqueAsync(planRepository, dto.Slug, excludeId: null, cancellationToken);
        await EnsureSkuIsUniqueAsync(planRepository, dto.Sku, excludeId: null, cancellationToken);
        var region = await GetRegionOrThrowAsync(dto.RegionId, cancellationToken);
        var addonsById = await GetAddonsOrThrowAsync(dto.Addons.Select(a => a.AddonId), cancellationToken);
        ValidateCustomPackageConfig(
            dto.PackageType,
            dto.MinVcpu, dto.MaxVcpu, dto.StepVcpu,
            dto.MinRamMb, dto.MaxRamMb, dto.StepRamMb,
            dto.MinDiskGb, dto.MaxDiskGb, dto.StepDiskGb,
            dto.PricePerVcpuPerMonth, dto.PricePerRamGbPerMonth, dto.PricePerDiskGbPerMonth);

        var plan = new ServicePlan
        {
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Slug = dto.Slug,
            Sku = dto.Sku,
            ShortDescription = dto.ShortDescription,
            Description = dto.Description,
            IsFeatured = dto.IsFeatured,
            Status = dto.Status,
            AllowGrandfatheredRenewal = dto.AllowGrandfatheredRenewal,
            AllowDowngrade = dto.AllowDowngrade,
            RegionId = dto.RegionId,
            // Gán thẳng entity đã fetch (không chỉ RegionId) - để MapToDto trả RegionName đúng ngay
            // trong response Create/Update mà không cần query lại (EF chưa tự nạp nav prop vừa gán FK).
            Region = region,
            PackageType = dto.PackageType,
            MinVcpu = dto.MinVcpu,
            MaxVcpu = dto.MaxVcpu,
            StepVcpu = dto.StepVcpu,
            MinRamMb = dto.MinRamMb,
            MaxRamMb = dto.MaxRamMb,
            StepRamMb = dto.StepRamMb,
            MinDiskGb = dto.MinDiskGb,
            MaxDiskGb = dto.MaxDiskGb,
            StepDiskGb = dto.StepDiskGb,
            PricePerVcpuPerMonth = dto.PricePerVcpuPerMonth,
            PricePerRamGbPerMonth = dto.PricePerRamGbPerMonth,
            PricePerDiskGbPerMonth = dto.PricePerDiskGbPerMonth,
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
            // Gói mới tạo - mọi giá đều là Version 1 hiện hành, chưa có gì để "đóng" (khác UpdateAsync).
            Prices = dto.Prices.Select(p => new PlanPrice
            {
                PeriodMonths = p.PeriodMonths,
                Price = p.Price,
                PromotionalPrice = p.PromotionalPrice,
                Currency = p.Currency,
                IsDefault = p.IsDefault,
                IsActive = p.IsActive,
                DiscountPercent = p.DiscountPercent,
                Version = 1,
                IsCurrent = true,
                EffectiveFrom = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            }).ToList(),
            PlanAddons = dto.Addons.Select(a => new ServicePlanAddon
            {
                AddonId = a.AddonId,
                Addon = addonsById[a.AddonId],
                MaxQuantity = a.MaxQuantity
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
            .Include(p => p.PlanAddons)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(ServicePlan), id);
        }

        await EnsureCategoryExistsAsync(dto.CategoryId, cancellationToken);
        await EnsureSlugIsUniqueAsync(planRepository, dto.Slug, excludeId: id, cancellationToken);
        await EnsureSkuIsUniqueAsync(planRepository, dto.Sku, excludeId: id, cancellationToken);
        var region = await GetRegionOrThrowAsync(dto.RegionId, cancellationToken);
        var addonsById = await GetAddonsOrThrowAsync(dto.Addons.Select(a => a.AddonId), cancellationToken);
        ValidateCustomPackageConfig(
            dto.PackageType,
            dto.MinVcpu, dto.MaxVcpu, dto.StepVcpu,
            dto.MinRamMb, dto.MaxRamMb, dto.StepRamMb,
            dto.MinDiskGb, dto.MaxDiskGb, dto.StepDiskGb,
            dto.PricePerVcpuPerMonth, dto.PricePerRamGbPerMonth, dto.PricePerDiskGbPerMonth);

        entity.CategoryId = dto.CategoryId;
        entity.Name = dto.Name;
        entity.Slug = dto.Slug;
        entity.Sku = dto.Sku;
        entity.ShortDescription = dto.ShortDescription;
        entity.Description = dto.Description;
        entity.IsFeatured = dto.IsFeatured;
        entity.Status = dto.Status;
        entity.AllowGrandfatheredRenewal = dto.AllowGrandfatheredRenewal;
        entity.AllowDowngrade = dto.AllowDowngrade;
        entity.RegionId = dto.RegionId;
        entity.Region = region;
        entity.PackageType = dto.PackageType;
        entity.MinVcpu = dto.MinVcpu;
        entity.MaxVcpu = dto.MaxVcpu;
        entity.StepVcpu = dto.StepVcpu;
        entity.MinRamMb = dto.MinRamMb;
        entity.MaxRamMb = dto.MaxRamMb;
        entity.StepRamMb = dto.StepRamMb;
        entity.MinDiskGb = dto.MinDiskGb;
        entity.MaxDiskGb = dto.MaxDiskGb;
        entity.StepDiskGb = dto.StepDiskGb;
        entity.PricePerVcpuPerMonth = dto.PricePerVcpuPerMonth;
        entity.PricePerRamGbPerMonth = dto.PricePerRamGbPerMonth;
        entity.PricePerDiskGbPerMonth = dto.PricePerDiskGbPerMonth;
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

        ApplyPriceVersioning(entity, dto.Prices);

        // Bảng nối đơn giản (không có gì tham chiếu tới ServicePlanAddon từ bên ngoài - đơn hàng chỉ
        // tham chiếu thẳng AddonId, xem OrderRequestItemAddon.cs) - Clear() rồi re-add an toàn, khác
        // Prices ở trên không cần giữ lịch sử.
        entity.PlanAddons.Clear();
        foreach (var a in dto.Addons)
        {
            entity.PlanAddons.Add(new ServicePlanAddon
            {
                AddonId = a.AddonId,
                Addon = addonsById[a.AddonId],
                MaxQuantity = a.MaxQuantity
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

    // RegionId là tuỳ chọn (trang trí - xem Region.cs) - null thì bỏ qua, không throw.
    private async Task<Region?> GetRegionOrThrowAsync(string? regionId, CancellationToken cancellationToken)
    {
        if (regionId is null)
        {
            return null;
        }

        var region = await _unitOfWork.Repository<Region, string>().GetByIdAsync(regionId, cancellationToken);
        if (region is null)
        {
            throw new NotFoundException(nameof(Region), regionId);
        }

        return region;
    }

    // Trả về map AddonId -> Addon đã fetch (dùng luôn để gán nav prop ServicePlanAddon.Addon, tránh
    // query lại lúc map response - xem GetRegionOrThrowAsync áp dụng cùng ý tưởng cho Region). Throw
    // NotFoundException nếu bất kỳ AddonId nào Admin gửi lên không tồn tại.
    private async Task<Dictionary<int, Addon>> GetAddonsOrThrowAsync(IEnumerable<int> addonIds, CancellationToken cancellationToken)
    {
        var distinctIds = addonIds.Distinct().ToList();
        if (distinctIds.Count == 0)
        {
            return new Dictionary<int, Addon>();
        }

        var addons = await _unitOfWork.Repository<Addon, int>().Query()
            .Where(a => distinctIds.Contains(a.Id))
            .ToDictionaryAsync(a => a.Id, cancellationToken);

        var missingIds = distinctIds.Where(id => !addons.ContainsKey(id)).ToList();
        if (missingIds.Count > 0)
        {
            throw new NotFoundException(nameof(Addon), missingIds[0]);
        }

        return addons;
    }

    // Chỉ validate khi Custom - Fixed bỏ qua toàn bộ Min/Max/Step/PricePerUnit (có gửi lên cũng
    // không dùng tới, xem ServicePlan.cs).
    private static void ValidateCustomPackageConfig(
        ServicePlanPackageType packageType,
        int? minVcpu, int? maxVcpu, int? stepVcpu,
        int? minRamMb, int? maxRamMb, int? stepRamMb,
        int? minDiskGb, int? maxDiskGb, int? stepDiskGb,
        decimal? pricePerVcpu, decimal? pricePerRamGb, decimal? pricePerDiskGb)
    {
        if (packageType != ServicePlanPackageType.Custom)
        {
            return;
        }

        ValidateCustomDimension("vCPU", minVcpu, maxVcpu, stepVcpu);
        ValidateCustomDimension("RAM", minRamMb, maxRamMb, stepRamMb);
        ValidateCustomDimension("Disk", minDiskGb, maxDiskGb, stepDiskGb);

        if (pricePerVcpu is null || pricePerRamGb is null || pricePerDiskGb is null)
        {
            throw new ValidationException("Gói tuỳ biến cần nhập đủ đơn giá vCPU/RAM/Disk.");
        }
    }

    private static void ValidateCustomDimension(string label, int? min, int? max, int? step)
    {
        if (min is null || max is null || step is null)
        {
            throw new ValidationException($"Gói tuỳ biến cần nhập đủ Min/Max/Bước nhảy cho {label}.");
        }
        if (step <= 0)
        {
            throw new ValidationException($"Bước nhảy {label} phải lớn hơn 0.");
        }
        if (min > max)
        {
            throw new ValidationException($"Giá trị nhỏ nhất {label} phải nhỏ hơn hoặc bằng giá trị lớn nhất.");
        }
        if ((max.Value - min.Value) % step.Value != 0)
        {
            throw new ValidationException($"Khoảng {label} phải chia hết cho bước nhảy.");
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

    // Sku là tuỳ chọn (nullable) - chỉ kiểm tra trùng khi Admin thực sự nhập giá trị.
    private static async Task EnsureSkuIsUniqueAsync(
        IRepository<ServicePlan, int> repository,
        string? sku,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(sku))
        {
            return;
        }

        var isDuplicate = await repository.Query()
            .AnyAsync(p => p.Sku == sku && p.Id != (excludeId ?? 0), cancellationToken);

        if (isDuplicate)
        {
            throw new ConflictException($"Sku '{sku}' đã tồn tại.");
        }
    }

    // Price Versioning & Grandfathering (thay "Clear() rồi re-add" cũ - sẽ mất hết lịch sử giá, phá vỡ
    // OrderRequestItem.PlanPriceId của khách đã mua trước): diff theo PeriodMonths giữa các row
    // IsCurrent hiện có với danh sách Admin gửi lên - CHỈ đóng (IsCurrent=false) row cũ khi thật sự đổi
    // giá, không bao giờ hard-delete (xem PlanPrice.cs).
    private static void ApplyPriceVersioning(ServicePlan entity, List<PlanPriceInputDto> submittedPrices)
    {
        var now = DateTime.UtcNow;
        var currentByPeriod = entity.Prices
            .Where(p => p.IsCurrent)
            .ToDictionary(p => p.PeriodMonths);

        foreach (var p in submittedPrices)
        {
            if (currentByPeriod.TryGetValue(p.PeriodMonths, out var existing))
            {
                // DiscountPercent so sánh cùng nhóm với Price/PromotionalPrice - với plan Custom, đây
                // mới là field thực sự đổi (Price/PromotionalPrice bị bỏ qua, xem PlanPrice.cs).
                var priceChanged = existing.Price != p.Price
                    || existing.PromotionalPrice != p.PromotionalPrice
                    || existing.Currency != p.Currency
                    || existing.DiscountPercent != p.DiscountPercent;

                if (priceChanged)
                {
                    existing.IsCurrent = false;
                    existing.EffectiveTo = now;

                    entity.Prices.Add(new PlanPrice
                    {
                        PeriodMonths = p.PeriodMonths,
                        Price = p.Price,
                        PromotionalPrice = p.PromotionalPrice,
                        Currency = p.Currency,
                        IsDefault = p.IsDefault,
                        IsActive = p.IsActive,
                        DiscountPercent = p.DiscountPercent,
                        Version = existing.Version + 1,
                        IsCurrent = true,
                        EffectiveFrom = now,
                        CreatedAt = now
                    });
                }
                else
                {
                    // Giá không đổi - chỉ cập nhật cờ hiển thị trên row hiện hành, không sinh version mới.
                    existing.IsDefault = p.IsDefault;
                    existing.IsActive = p.IsActive;
                    existing.UpdatedAt = now;
                }
            }
            else
            {
                entity.Prices.Add(new PlanPrice
                {
                    PeriodMonths = p.PeriodMonths,
                    Price = p.Price,
                    PromotionalPrice = p.PromotionalPrice,
                    Currency = p.Currency,
                    IsDefault = p.IsDefault,
                    IsActive = p.IsActive,
                    DiscountPercent = p.DiscountPercent,
                    Version = 1,
                    IsCurrent = true,
                    EffectiveFrom = now,
                    CreatedAt = now
                });
            }
        }

        // PeriodMonths bị Admin xoá khỏi form - đóng lại (không còn bán), giữ nguyên trong DB.
        var submittedPeriods = submittedPrices.Select(p => p.PeriodMonths).ToHashSet();
        foreach (var stale in currentByPeriod.Where(kv => !submittedPeriods.Contains(kv.Key)).Select(kv => kv.Value))
        {
            stale.IsCurrent = false;
            stale.IsActive = false;
            stale.EffectiveTo = now;
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
            Sku = plan.Sku,
            ShortDescription = plan.ShortDescription,
            Description = plan.Description,
            IsFeatured = plan.IsFeatured,
            Status = plan.Status.ToString(),
            AllowGrandfatheredRenewal = plan.AllowGrandfatheredRenewal,
            AllowDowngrade = plan.AllowDowngrade,
            RegionId = plan.RegionId,
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
            // Chỉ trả version hiện hành - form Admin sửa/tạo giá dựa trên đúng 1 row/PeriodMonths, các
            // row cũ đã đóng (IsCurrent=false) chỉ còn ý nghĩa tra cứu nội bộ (Grandfathering), không
            // hiển thị lại cho Admin (tránh trùng lặp gây nhầm lẫn trên form).
            Prices = plan.Prices.Where(p => p.IsCurrent).Select(p => new PlanPriceDto
            {
                PeriodMonths = p.PeriodMonths,
                Price = p.Price,
                PromotionalPrice = p.PromotionalPrice,
                Currency = p.Currency,
                IsDefault = p.IsDefault,
                DiscountPercent = p.DiscountPercent
            }).ToList(),
            Addons = plan.PlanAddons.Select(pa => new PlanAddonDto
            {
                AddonId = pa.AddonId,
                AddonName = pa.Addon.Name,
                Type = pa.Addon.Type.ToString(),
                BillingType = pa.Addon.BillingType.ToString(),
                UnitName = pa.Addon.UnitName,
                PricePerMonth = pa.Addon.PricePerMonth,
                MaxQuantity = pa.MaxQuantity
            }).ToList()
        };
    }
}
