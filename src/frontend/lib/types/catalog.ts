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

// Khớp Application/Features/Catalog/ServicePlans/Dtos/*.cs
export interface ServicePlanQueryParams extends PaginationParams {
  categorySlug?: string;
  isFeatured?: boolean;
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
}

export interface ServicePlanListItemDto {
  id: number;
  name: string;
  slug: string;
  shortDescription?: string | null;
  isFeatured: boolean;
  qrCodeUrl?: string | null;
  categoryName: string;
  categorySlug: string;
  startingPrice?: number | null;
  features: PlanFeatureDto[];
  prices: PlanPriceDto[];
}

export interface ServicePlanDetailDto {
  id: number;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  isFeatured: boolean;
  qrCodeUrl?: string | null;
  categoryName: string;
  categorySlug: string;
  features: PlanFeatureDto[];
  prices: PlanPriceDto[];
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
