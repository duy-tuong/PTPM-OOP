import type { PaginationParams } from "./common";
import type { PlanFeatureDto, PlanPriceDto, PlanAddonDto, PlanOsImageDto, ServicePlanCustomConfigFields } from "./catalog";
import type { OrderRequestItemDto } from "./sales";
import type {
  AddonBillingType,
  AddonType,
  AffiliateApplicationStatus,
  ConsultationStatus,
  CustomerType,
  DiscountType,
  OrderRequestStatus,
  OsFamily,
  PromotionCustomerEligibility,
  ScopeType,
  ServicePlanPackageType,
  ServicePlanStatus,
} from "./enums";

// ---- Admin Catalog: Service Categories ----
// Khớp Application/Features/Admin/Catalog/ServiceCategories/Dtos/*.cs
export interface AdminServiceCategoryDto {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateServiceCategoryDto {
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

export type UpdateServiceCategoryDto = CreateServiceCategoryDto;

// ---- Admin Catalog: Service Plans ----
// Khớp Application/Features/Admin/Catalog/ServicePlans/Dtos/*.cs
export interface AdminServicePlanDto extends ServicePlanCustomConfigFields {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  sku?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  isFeatured: boolean;
  // string (không phải enum) - response đã map sẵn thành tên chuỗi (vd "Active"), khớp
  // AdminServicePlanDto.cs. Dùng cùng SERVICE_PLAN_STATUS_LABELS ở lib/types/enums.ts để hiển thị.
  status: string;
  // Price Versioning & Grandfathering - Admin gia hạn cùng chu kỳ có được giữ giá cũ hay luôn tính
  // giá sống hiện hành.
  allowGrandfatheredRenewal: boolean;
  // Đổi gói (Phần 6) - có cho khách HẠ CẤP xuống gói này hay không (nâng cấp luôn được phép nếu Active).
  allowDowngrade: boolean;
  regionId?: string | null;
  regionName?: string | null;
  displayOrder: number;
  qrCodeUrl?: string | null;
  features: PlanFeatureDto[];
  prices: PlanPriceDto[];
  addons: PlanAddonDto[];
  osImages: PlanOsImageDto[];
}

export interface PlanFeatureInputDto {
  featureKey: string;
  featureLabel: string;
  featureValueText: string;
  featureValueNumeric?: number;
  featureUnit?: string;
  displayOrder: number;
  isHighlighted: boolean;
}

export interface PlanPriceInputDto {
  periodMonths: number;
  price: number;
  promotionalPrice?: number;
  currency: string;
  isDefault: boolean;
  isActive: boolean;
  // Chỉ có ý nghĩa khi ServicePlan.packageType = Custom - % giảm giá theo chu kỳ này (price bị bỏ qua).
  discountPercent?: number;
}

export interface PlanAddonInputDto {
  addonId: number;
  maxQuantity: number;
}

export interface PlanOsImageInputDto {
  osImageId: number;
  isDefault: boolean;
}

export interface CreateServicePlanDto {
  categoryId: number;
  name: string;
  slug: string;
  sku?: string;
  shortDescription?: string;
  description?: string;
  isFeatured: boolean;
  // enum thật (không phải string) - request body backend chưa có JsonStringEnumConverter, phải gửi
  // số nguyên khớp CloudServiceStore.Domain.Enums.ServicePlanStatus (xem ghi chú đầu file này).
  status: ServicePlanStatus;
  allowGrandfatheredRenewal: boolean;
  allowDowngrade: boolean;
  regionId?: string;
  // enum thật (không phải string), cùng lý do với status - xem ghi chú đầu file. Fixed = giá cố định
  // (dùng khối Prices bên dưới); Custom = kéo thanh trượt, dùng khối Min/Max/Step/PricePerUnit,
  // Prices[].price bị bỏ qua (chỉ discountPercent có ý nghĩa).
  packageType: ServicePlanPackageType;
  minVcpu?: number;
  maxVcpu?: number;
  stepVcpu?: number;
  minRamMb?: number;
  maxRamMb?: number;
  stepRamMb?: number;
  minDiskGb?: number;
  maxDiskGb?: number;
  stepDiskGb?: number;
  pricePerVcpuPerMonth?: number;
  pricePerRamGbPerMonth?: number;
  pricePerDiskGbPerMonth?: number;
  displayOrder: number;
  features: PlanFeatureInputDto[];
  prices: PlanPriceInputDto[];
  addons: PlanAddonInputDto[];
  osImages: PlanOsImageInputDto[];
}

export type UpdateServicePlanDto = CreateServicePlanDto;

// ---- Admin Catalog: Addons ----
// Khớp Application/Features/Admin/Catalog/Addons/Dtos/*.cs
export interface AdminAddonDto {
  id: number;
  name: string;
  sku: string;
  // string (không phải enum) - khớp convention response DTO khác trong dự án.
  type: string;
  billingType: string;
  unitName?: string | null;
  pricePerMonth: number;
  isActive: boolean;
}

export interface CreateAddonDto {
  name: string;
  sku: string;
  type: AddonType;
  billingType: AddonBillingType;
  unitName?: string;
  pricePerMonth: number;
  isActive: boolean;
}

export type UpdateAddonDto = CreateAddonDto;

// ---- Admin Catalog: OS Images ----
// Khớp Application/Features/Admin/Catalog/OsImages/Dtos/*.cs (Đợt 3, Phần 11)
export interface AdminOsImageDto {
  id: number;
  name: string;
  slug: string;
  // string (không phải enum) - khớp convention response DTO khác trong dự án.
  family: string;
  windowsLicenseFeePerMonth?: number | null;
  isActive: boolean;
  displayOrder: number;
}

export interface CreateOsImageDto {
  name: string;
  slug: string;
  family: OsFamily;
  windowsLicenseFeePerMonth?: number;
  isActive: boolean;
  displayOrder: number;
}

export type UpdateOsImageDto = CreateOsImageDto;

// ---- Admin Marketing: Promotions ----
// Khớp Application/Features/Admin/Marketing/Promotions/Dtos/*.cs
export interface PromotionScopeDto {
  scopeType: string;
  serviceCategoryId?: number | null;
  serviceCategoryName?: string | null;
  servicePlanId?: number | null;
  servicePlanName?: string | null;
}

export interface PromotionScopeInputDto {
  scopeType: ScopeType;
  serviceCategoryId?: number;
  servicePlanId?: number;
}

export interface AdminPromotionDto {
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
  usageLimit?: number | null;
  usageCount: number;
  isActive: boolean;
  customerEligibility: string;
  scopes: PromotionScopeDto[];
}

export interface CreatePromotionDto {
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  isActive: boolean;
  customerEligibility: PromotionCustomerEligibility;
  scopes: PromotionScopeInputDto[];
}

export type UpdatePromotionDto = CreatePromotionDto;

// ---- Admin Content: Content Pages ----
// Khớp Application/Features/Admin/Content/ContentPages/Dtos/*.cs
export interface AdminContentPageDto {
  id: number;
  slug: string;
  title: string;
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  authorId: string;
  isPublished: boolean;
  publishedAt?: string | null;
  displayOrder: number;
}

export interface CreateContentPageDto {
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  displayOrder: number;
}

export type UpdateContentPageDto = CreateContentPageDto;

// ---- Admin Content: FAQs ----
// Khớp Application/Features/Admin/Content/Faqs/Dtos/*.cs
export interface AdminFaqDto {
  id: number;
  question: string;
  answer: string;
  serviceCategoryId?: number | null;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateFaqDto {
  question: string;
  answer: string;
  serviceCategoryId?: number;
  displayOrder: number;
  isActive: boolean;
}

export type UpdateFaqDto = CreateFaqDto;

// ---- Admin Content: News Categories ----
// Khớp Application/Features/Admin/Content/NewsCategories/Dtos/*.cs
export interface AdminNewsCategoryDto {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateNewsCategoryDto {
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export type UpdateNewsCategoryDto = CreateNewsCategoryDto;

// ---- Admin Content: News Articles ----
// Khớp Application/Features/Admin/Content/NewsArticles/Dtos/*.cs
export interface AdminNewsArticleDto {
  id: number;
  newsCategoryId: number;
  title: string;
  slug: string;
  summary?: string | null;
  content: string;
  thumbnailUrl?: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: string;
  viewCount: number;
  authorId: string;
  tags: string[];
}

export interface CreateNewsArticleDto {
  newsCategoryId: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  thumbnailUrl?: string;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: string;
  tagNames: string[];
}

export type UpdateNewsArticleDto = CreateNewsArticleDto;

// Query params dùng chung cho GET /api/admin/service-plans, /admin/news-articles (thêm ở Phase 6.0)
export interface AdminServicePlanQueryParams extends PaginationParams {
  categorySlug?: string;
  isFeatured?: boolean;
  status?: ServicePlanStatus;
  regionId?: string;
}

export interface AdminNewsArticleQueryParams extends PaginationParams {
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
}

// ---- Admin Sales: Order Requests ----
// Khớp Application/Features/Admin/Sales/OrderRequests/Dtos/*.cs
export interface AdminOrderRequestDto {
  id: number;
  orderCode: string;
  customerType: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string | null;
  items: OrderRequestItemDto[];
  totalPrice: number;
  note?: string | null;
  status: string;
  assignedToUserId?: string | null;
  assignedToUserName?: string | null;
  source?: string | null;
  createdAt: string;
  // Fraud Review (Đợt 2, Phần 9) - xem OrderRequestService.EvaluateFraudRiskAsync (backend).
  isFlaggedForReview: boolean;
  flagReason?: string | null;
}

export interface OrderRequestQueryParams extends PaginationParams {
  status?: OrderRequestStatus;
  // Fraud Review (Đợt 2, Phần 9) - true = chỉ đơn bị gắn cờ nghi vấn.
  flaggedOnly?: boolean;
}

export interface UpdateOrderRequestStatusDto {
  newStatus: OrderRequestStatus;
}

// ---- Admin Sales: Consultation Requests ----
// Khớp Application/Features/Admin/Sales/ConsultationRequests/Dtos/*.cs
export interface AdminConsultationRequestDto {
  id: number;
  requestCode: string;
  fullName: string;
  email: string;
  phone: string;
  companyName?: string | null;
  subject: string;
  message: string;
  status: string;
  assignedToUserName?: string | null;
  createdAt: string;
}

export interface UpdateConsultationRequestStatusDto {
  newStatus: ConsultationStatus;
}

// ---- Admin Sales: Affiliate Applications ----
// Khớp Application/Features/Admin/Sales/AffiliateApplications/Dtos/*.cs
export interface AdminAffiliateApplicationDto {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  websiteUrl?: string | null;
  promotionPlan?: string | null;
  status: string;
  reviewedByUserName?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  createdAt: string;
}

export interface UpdateAffiliateApplicationStatusDto {
  newStatus: AffiliateApplicationStatus;
  reviewNote?: string;
}

// ---- Admin Reporting ----
// Khớp Application/Features/Admin/Reporting/DashboardStats/Dtos/*.cs
export interface MonthlyRequestStatDto {
  month: string;
  orderRequestCount: number;
  consultationRequestCount: number;
}

export interface TopServicePlanStatDto {
  servicePlanId: number;
  servicePlanName: string;
  requestCount: number;
}

export interface DashboardStatsDto {
  totalOrderRequests: number;
  totalConsultationRequests: number;
  totalAffiliateApplications: number;
  pendingOrderRequests: number;
  monthlyStats: MonthlyRequestStatDto[];
  topServicePlans: TopServicePlanStatDto[];
}

// Khớp Application/Features/Admin/Reporting/RevenueAnalytics/Dtos/*.cs (Đợt 2 - Kinh doanh, Phần 7)
export interface RevenueAnalyticsSummaryDto {
  mrr: number;
  arr: number;
  newMrr: number;
  churnedMrr: number;
  netNewMrr: number;
  arpu: number;
  churnRatePercent: number;
  ltv: number;
}

export interface MrrTrendPointDto {
  month: string;
  newMrrBookings: number;
}

export interface RevenueByProductLineDto {
  productLine: string;
  revenue: number;
}

export interface RevenueByRegionDto {
  regionName: string;
  revenue: number;
}

export interface ArAgingBucketDto {
  bucketLabel: string;
  amount: number;
  orderCount: number;
}

// Khớp Application/Features/Admin/Reporting/AuditLogs/Dtos/*.cs
export interface AuditLogQueryParams extends PaginationParams {
  entityName?: string;
}

export interface AdminAuditLogDto {
  id: number;
  userId?: string | null;
  userName?: string | null;
  action: string;
  entityName: string;
  entityId: string;
  oldValues?: string | null;
  newValues?: string | null;
  timestamp: string;
}

// ---- Admin Content: Testimonials ----
// Khớp Application/Features/Admin/Content/Testimonials/Dtos/*.cs
export interface AdminTestimonialDto {
  id: number;
  displayName: string;
  companyName?: string | null;
  avatarUrl?: string | null;
  content: string;
  rating?: number | null;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateTestimonialDto {
  displayName: string;
  companyName?: string;
  avatarUrl?: string;
  content: string;
  rating?: number;
  displayOrder: number;
  isActive: boolean;
}

export type UpdateTestimonialDto = CreateTestimonialDto;

// ---- Admin Content: Partners ----
// Khớp Application/Features/Admin/Content/Partners/Dtos/*.cs
export interface AdminPartnerDto {
  id: number;
  name: string;
  logoUrl: string;
  websiteUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface CreatePartnerDto {
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

export type UpdatePartnerDto = CreatePartnerDto;

// ---- Admin Catalog: TLD Pricing ----
// Khớp Application/Features/Admin/Catalog/TldPricings/Dtos/*.cs
export interface AdminTldPricingDto {
  id: number;
  tld: string;
  serviceCategoryId?: number | null;
  registerPrice: number;
  renewPrice: number;
  transferPrice: number;
  currency: string;
  isActive: boolean;
}

export interface CreateTldPricingDto {
  tld: string;
  serviceCategoryId?: number;
  registerPrice: number;
  renewPrice: number;
  transferPrice: number;
  currency: string;
  isActive: boolean;
}

export type UpdateTldPricingDto = CreateTldPricingDto;

// ---- Admin Content: News Comments ----
// Khớp Application/Features/Admin/Content/NewsComments/Dtos/*.cs
export interface AdminNewsCommentDto {
  id: number;
  newsArticleId: number;
  newsArticleTitle: string;
  parentCommentId?: number | null;
  authorDisplayName: string;
  authorEmail?: string | null;
  content: string;
  isApproved: boolean;
  createdAt: string;
}

export interface NewsCommentQueryParams extends PaginationParams {
  newsArticleId?: number;
  isApproved?: boolean;
}

export interface UpdateNewsCommentApprovalDto {
  isApproved: boolean;
}

// ---- Admin Identity: Customers ----
// Khớp Application/Features/Admin/Identity/Customers/Dtos/*.cs
export interface AdminCustomerDto {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  customerType: string;
  companyName?: string | null;
  taxCode?: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  // CRM: Hồ sơ B2B & Sales Rep (Đợt 2, Phần 10).
  billingAddress?: string | null;
  legalRepresentativeName?: string | null;
  businessLicenseNumber?: string | null;
  creditLimit?: number | null;
  assignedSalesRepUserId?: string | null;
  assignedSalesRepUserName?: string | null;
}

// Khớp Application/Features/Admin/Identity/Customers/Dtos/UpdateCustomerDto.cs - PUT ghi đè toàn bộ
// field, assignedSalesRepUserId=null nghĩa là "bỏ gán" (không phải "không đổi").
export interface UpdateCustomerDto {
  billingAddress?: string | null;
  legalRepresentativeName?: string | null;
  businessLicenseNumber?: string | null;
  creditLimit?: number | null;
  assignedSalesRepUserId?: string | null;
}

export interface CustomerQueryParams extends PaginationParams {
  search?: string;
  // CRM: Hồ sơ B2B & Sales Rep (Đợt 2, Phần 10).
  customerType?: CustomerType;
  assignedSalesRepUserId?: string;
}

export interface UpdateCustomerActiveStatusDto {
  isActive: boolean;
}

// ---- Admin Identity: Users (nhân viên - Admin/Editor) ----
// Khớp Application/Features/Admin/Identity/Users/Dtos/*.cs
export interface AdminUserDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

export interface CreateUserDto {
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  password: string;
  roleIds: number[];
}

export interface UpdateUserDto {
  fullName: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  roleIds: number[];
}

export interface ResetUserPasswordDto {
  newPassword: string;
}

// ---- Admin System: Site Settings ----
// Khớp Application/Features/Admin/System/SiteSettings/Dtos/*.cs
export interface AdminSiteSettingDto {
  id: number;
  settingKey: string;
  settingValue: string;
  settingGroup: string;
  dataType: string;
  updatedAt?: string | null;
}

export interface CreateSiteSettingDto {
  settingKey: string;
  settingValue: string;
  settingGroup: string;
  dataType: string;
}

export type UpdateSiteSettingDto = CreateSiteSettingDto;
