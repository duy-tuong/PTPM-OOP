import type { CustomerType } from "./enums";

// Khớp Application/Features/Sales/OrderRequests/Dtos/AddonSelectionDto.cs
export interface AddonSelectionDto {
  addonId: number;
  quantity: number;
}

// Khớp Application/Features/Sales/OrderRequests/Dtos/CreateOrderRequestItemDto.cs
export interface CreateOrderRequestItemDto {
  servicePlanId?: number;
  tldPricingId?: number;
  domainName?: string;
  periodMonths?: number;
  quantity: number;
  addons?: AddonSelectionDto[];
  // Bắt buộc khi servicePlanId trỏ tới gói Custom (packageType === "Custom") - xem
  // OrderRequestService.BuildServicePlanItemAsync (backend).
  chosenVcpu?: number;
  chosenRamMb?: number;
  chosenDiskGb?: number;
  // Hệ điều hành đã chọn (Đợt 3, Phần 11) - chỉ có ý nghĩa khi servicePlanId có giá trị, tuỳ chọn.
  osImageId?: number;

  // Xác thực & bàn giao (Đợt 3, Phần 12) - đều tuỳ chọn, chỉ có ý nghĩa khi servicePlanId có giá trị.
  sshPublicKeyId?: number;
  hostname?: string;
  tags?: string;
}

// Khớp Application/Features/Customers/SshKeys/Dtos/*.cs (Đợt 3, Phần 12)
export interface CustomerSshKeyDto {
  id: number;
  label: string;
  publicKey: string;
  createdAt: string;
}

export interface CreateSshKeyDto {
  label: string;
  publicKey: string;
}

// Khớp Application/Features/Sales/OrderRequests/Dtos/CreateOrderRequestDto.cs - giỏ hàng nhiều dòng
// (header + items[]), thay cho shape "1 sản phẩm/đơn" cũ.
export interface CreateOrderRequestDto {
  customerType: CustomerType;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  taxCode?: string;
  promotionId?: number;
  note?: string;
  items: CreateOrderRequestItemDto[];
}

export interface OrderRequestDto {
  id: number;
  orderCode: string;
  status: string;
  totalPrice: number;
  createdAt: string;
}

// Khớp Application/Features/Sales/OrderRequests/Dtos/OrderLookupDto.cs - dùng cho trang public
// /thanh-toan/[orderCode], KHÔNG chứa PII khách hàng (endpoint tra cứu không xác thực).
// Khớp Application/Features/Sales/OrderRequests/Dtos/OrderItemAddonDto.cs
export interface OrderItemAddonDto {
  addonId: number;
  addonName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderLookupItemDto {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  chosenVcpu?: number | null;
  chosenRamMb?: number | null;
  chosenDiskGb?: number | null;
  // Hệ điều hành đã chọn lúc mua (Đợt 3, Phần 11) - null nếu không chọn.
  osImageName?: string | null;
  // "New" | "Renewal" | "PlanChange" - xem ghi chú OrderRequestItemDto.ItemKind (backend). Đặc biệt
  // quan trọng ở trang /thanh-toan: đơn "PlanChange" chỉ thu đúng phần PHỤ THU proration, không phải
  // giá đầy đủ của productName.
  itemKind: string;
  addons: OrderItemAddonDto[];
}

export interface OrderLookupDto {
  orderCode: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  items: OrderLookupItemDto[];
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  // Chỉ có giá trị khi đơn còn ở trạng thái trước Paid (New/Contacted/Confirmed) - xem
  // OrderRequestService.GetByCodeAsync (backend sinh lười lúc gọi endpoint này).
  payOsCheckoutUrl?: string | null;
  payOsQrCodeImage?: string | null;
}

// Khớp Application/Features/Sales/ConsultationRequests/Dtos/*.cs
export interface CreateConsultationRequestDto {
  customerType: CustomerType;
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  serviceCategoryId?: number;
  subject: string;
  message: string;
}

export interface ConsultationRequestDto {
  id: number;
  requestCode: string;
  status: string;
  createdAt: string;
}

// Khớp Application/Features/Sales/AffiliateApplications/Dtos/*.cs
export interface CreateAffiliateApplicationDto {
  fullName: string;
  email: string;
  phone: string;
  websiteUrl?: string;
  promotionPlan?: string;
}

export interface AffiliateApplicationDto {
  id: number;
  status: string;
  createdAt: string;
}

// Khớp Application/Features/Sales/OrderRequests/Dtos/OrderRequestItemDto.cs - dùng chung cho response
// khách hàng (MyOrderRequestDto) và Admin (AdminOrderRequestDto, xem lib/types/admin.ts).
export interface OrderRequestItemDto {
  id: number;
  servicePlanId?: number | null;
  servicePlanName?: string | null;
  tldPricingId?: number | null;
  tldName?: string | null;
  domainName?: string | null;
  periodMonths?: number | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  chosenVcpu?: number | null;
  chosenRamMb?: number | null;
  chosenDiskGb?: number | null;
  // Hệ điều hành đã chọn lúc mua (Đợt 3, Phần 11) - null nếu không chọn. osLicenseFee là phần phụ phí
  // bản quyền Windows ĐÃ cộng vào unitPrice (snapshot) - null nếu Linux/không chọn.
  osImageName?: string | null;
  osLicenseFee?: number | null;
  // Hostname/Tags bàn giao (Đợt 3, Phần 12) - null nếu không nhập.
  hostname?: string | null;
  tags?: string | null;
  // "New" | "Renewal" | "PlanChange" - xem ORDER_ITEM_KIND_LABELS ở lib/utils/orderItems.ts.
  itemKind: string;
  // "Active" | "Overdue" | "Suspended" | "Terminated" | null - null cho item "biên lai" (itemKind !=
  // "New", không có vòng đời riêng). Xem LIFECYCLE_STATUS_LABELS ở lib/utils/orderItems.ts.
  lifecycleStatus?: string | null;
  // Thông tin bàn giao mô phỏng (Tier 3 - "cấp phát tự động") - chỉ có giá trị sau khi đơn Completed.
  provisionedIpAddress?: string | null;
  provisionedRootPassword?: string | null;
  provisionedNameservers?: string | null;
  provisionedAt?: string | null;
  addons: OrderItemAddonDto[];
}

// Khớp Application/Features/Sales/OrderRequests/Dtos/MyOrderRequestDto.cs - giỏ hàng nhiều dòng
// (items[]), thay cho các field phẳng "1 sản phẩm/đơn" cũ.
export interface MyOrderRequestDto {
  id: number;
  orderCode: string;
  items: OrderRequestItemDto[];
  totalPrice: number;
  status: string;
  createdAt: string;
}

// Khớp Application/Features/Sales/OrderRequests/Dtos/CreateRenewalOrderRequestDto.cs
export interface CreateRenewalOrderRequestDto {
  orderRequestItemId: number;
  periodMonths?: number;
  years?: number;
}

// Khớp Application/Features/Sales/OrderRequests/Dtos/MyServiceItemDto.cs - "Dịch vụ của tôi" (Tier 4,
// GET /order-requests/mine/services) - khác MyOrderRequestDto: đây là dịch vụ ĐANG SỐNG theo từng
// dòng, không gộp theo đơn, có ExpiresAt để hiển thị hạn dùng + nút gia hạn.
export interface MyServiceItemDto {
  itemId: number;
  orderCode: string;
  orderStatus: string;
  servicePlanId?: number | null;
  servicePlanName?: string | null;
  // Chỉ có ý nghĩa khi servicePlanId != null - dùng để ẩn nút "Đổi gói" khi Custom, và fetch danh sách
  // gói cùng danh mục làm gói đích (xem PlanChangeDialog.tsx).
  servicePlanCategorySlug?: string | null;
  servicePlanPackageType?: string | null;
  domainName?: string | null;
  tldName?: string | null;
  periodMonths?: number | null;
  expiresAt?: string | null;
  // "Active" | "Overdue" | "Suspended" | "Terminated" - xem LIFECYCLE_STATUS_LABELS ở lib/utils/orderItems.ts.
  lifecycleStatus: string;
  // Hệ điều hành đã chọn lúc mua (Đợt 3, Phần 11) - null nếu không chọn.
  osImageName?: string | null;
  // Hostname bàn giao (Đợt 3, Phần 12) - null nếu không nhập.
  hostname?: string | null;
  provisionedIpAddress?: string | null;
  provisionedRootPassword?: string | null;
  provisionedNameservers?: string | null;
}

// Khớp Application/Features/Sales/OrderRequests/Dtos/RequestPlanChangeDto.cs
export interface RequestPlanChangeDto {
  targetPlanId: number;
}

// Khớp Application/Features/Sales/OrderRequests/Dtos/PlanChangePreviewDto.cs
export interface PlanChangePreviewDto {
  targetPlanName: string;
  direction: string; // "Upgrade" | "Downgrade"
  amountDue: number;
  daysRemaining: number;
  requiresPayment: boolean;
}

// Khớp Application/Features/Sales/OrderRequests/Dtos/PlanChangeResultDto.cs
export interface PlanChangeResultDto {
  requiresPayment: boolean;
  orderCode?: string | null;
  amountDue: number;
}

// Khớp Application/Features/Sales/ConsultationRequests/Dtos/MyConsultationRequestDto.cs
export interface MyConsultationRequestDto {
  id: number;
  requestCode: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}
