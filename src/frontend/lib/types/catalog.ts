import type { PaginationParams } from "./common";

// Khớp Application/Features/Catalog/ServiceCategories/Dtos/ServiceCategoryDto.cs
export interface ServiceCategoryDto {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  displayOrder: number;
}

// Khớp Application/Features/Catalog/Regions/Dtos/RegionDto.cs
export interface RegionDto {
  id: string;
  name: string;
  city: string;
  countryCode: string;
}

// Khớp Application/Features/Catalog/ServicePlans/Dtos/*.cs
export interface ServicePlanQueryParams extends PaginationParams {
  categorySlug?: string;
  isFeatured?: boolean;
  regionId?: string;
}

export interface PlanFeatureDto {
  featureKey: string;
  featureLabel: string;
  featureValueText: string;
  featureValueNumeric?: number | null;
  featureUnit?: string | null;
  isHighlighted: boolean;
}

export interface PlanPriceDto {
  periodMonths: number;
  price: number;
  promotionalPrice?: number | null;
  currency: string;
  isDefault: boolean;
  // Chỉ có ý nghĩa khi plan.packageType === "Custom" - % giảm giá theo chu kỳ này, price/promotionalPrice
  // bị bỏ qua với gói Custom. Xem PlanPrice.DiscountPercent (backend).
  discountPercent?: number | null;
}

// Cấu hình gói Custom (kéo thanh trượt vCPU/RAM/Disk) - chỉ có giá trị khi packageType === "Custom".
export interface ServicePlanCustomConfigFields {
  packageType: string;
  minVcpu?: number | null;
  maxVcpu?: number | null;
  stepVcpu?: number | null;
  minRamMb?: number | null;
  maxRamMb?: number | null;
  stepRamMb?: number | null;
  minDiskGb?: number | null;
  maxDiskGb?: number | null;
  stepDiskGb?: number | null;
  pricePerVcpuPerMonth?: number | null;
  pricePerRamGbPerMonth?: number | null;
  pricePerDiskGbPerMonth?: number | null;
}

// Khớp Application/Features/Catalog/ServicePlans/Dtos/PlanAddonDto.cs - dùng chung cho cả response
// Admin (AdminServicePlanDto) và public (ServicePlanListItemDto/ServicePlanDetailDto).
export interface PlanAddonDto {
  addonId: number;
  addonName: string;
  type: string;
  billingType: string;
  unitName?: string | null;
  pricePerMonth: number;
  maxQuantity: number;
}

// Khớp Application/Features/Catalog/ServicePlans/Dtos/PlanOsImageDto.cs (Đợt 3, Phần 11) - dùng chung
// cho cả response Admin (AdminServicePlanDto) và public, mirror PlanAddonDto.
export interface PlanOsImageDto {
  osImageId: number;
  osImageName: string;
  family: string;
  windowsLicenseFeePerMonth?: number | null;
  isDefault: boolean;
}

export interface ServicePlanListItemDto extends ServicePlanCustomConfigFields {
  id: number;
  name: string;
  slug: string;
  shortDescription?: string | null;
  isFeatured: boolean;
  qrCodeUrl?: string | null;
  categoryName: string;
  categorySlug: string;
  regionName?: string | null;
  startingPrice?: number | null;
  features: PlanFeatureDto[];
  prices: PlanPriceDto[];
  addons: PlanAddonDto[];
  osImages: PlanOsImageDto[];
}

export interface ServicePlanDetailDto extends ServicePlanCustomConfigFields {
  id: number;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  isFeatured: boolean;
  qrCodeUrl?: string | null;
  categoryName: string;
  categorySlug: string;
  regionName?: string | null;
  features: PlanFeatureDto[];
  prices: PlanPriceDto[];
  addons: PlanAddonDto[];
  osImages: PlanOsImageDto[];
}

// Khớp Application/Features/Catalog/TldPricings/Dtos/*.cs
export interface TldPricingQueryParams extends PaginationParams {
  categorySlug?: string;
}

export interface TldPricingDto {
  id: number;
  tld: string;
  serviceCategoryName?: string | null;
  registerPrice: number;
  renewPrice: number;
  transferPrice: number;
  currency: string;
}

// Khớp Application/Features/Marketing/Promotions/Dtos/PromotionDto.cs
export interface PromotionDto {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderValue?: number | null;
  startDate: string;
  endDate: string;
}
