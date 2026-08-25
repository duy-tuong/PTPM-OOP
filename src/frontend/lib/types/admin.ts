import type { PaginationParams } from "./common";
import type { PlanFeatureDto, PlanPriceDto } from "./catalog";
import type { OrderRequestItemDto } from "./sales";
import type {
  AffiliateApplicationStatus,
  ConsultationStatus,
  DiscountType,
  OrderRequestStatus,
  ScopeType,
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
export interface AdminServicePlanDto {
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
  displayOrder: number;
  qrCodeUrl?: string | null;
  features: PlanFeatureDto[];
  prices: PlanPriceDto[];
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
  displayOrder: number;
  features: PlanFeatureInputDto[];
  prices: PlanPriceInputDto[];
}

export type UpdateServicePlanDto = CreateServicePlanDto;

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
  publishedAt?: string;
  tagNames: string[];
}

export type UpdateNewsArticleDto = CreateNewsArticleDto;

// Query params dùng chung cho GET /api/admin/service-plans, /admin/news-articles (thêm ở Phase 6.0)
export interface AdminServicePlanQueryParams extends PaginationParams {
  categorySlug?: string;
  isFeatured?: boolean;
  status?: ServicePlanStatus;
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
}

export interface OrderRequestQueryParams extends PaginationParams {
  status?: OrderRequestStatus;
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
}

export interface CustomerQueryParams extends PaginationParams {
  search?: string;
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
