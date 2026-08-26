// Backend chưa có JsonStringEnumConverter, nên khi GHI (request body) phải gửi số nguyên khớp
// CloudServiceStore.Domain.Enums.*; khi ĐỌC (response) các field status/type đã được backend map
// sẵn thành chuỗi tên enum (vd "New", "Contacted") -> dùng các *_LABELS bên dưới để hiển thị tiếng Việt.

export enum CustomerType {
  Individual = 1,
  Business = 2,
}

export enum OrderRequestStatus {
  New = 1,
  Contacted = 2,
  Confirmed = 3,
  Paid = 4,
  Provisioning = 5,
  Cancelled = 6,
  Completed = 7,
}

export enum ConsultationStatus {
  New = 1,
  Contacted = 2,
  Resolved = 3,
  Closed = 4,
}

export enum AffiliateApplicationStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
}

export enum DiscountType {
  Percentage = 1,
  FixedAmount = 2,
}

export enum ScopeType {
  All = 1,
  Category = 2,
  Plan = 3,
}

export enum ServicePlanStatus {
  Draft = 1,
  Active = 2,
  OutOfStock = 3,
  Archived = 4,
  Deprecated = 5,
}

export enum AddonType {
  Ip = 1,
  Disk = 2,
  Bandwidth = 3,
  License = 4,
  ManagedService = 5,
}

export enum AddonBillingType {
  FlatFee = 1,
  PerUnit = 2,
}

export enum ServicePlanPackageType {
  Fixed = 1,
  Custom = 2,
}

export enum OsFamily {
  Linux = 1,
  Windows = 2,
}

export enum PromotionCustomerEligibility {
  All = 1,
  NewCustomersOnly = 2,
  ExistingCustomersOnly = 3,
}

export const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  Individual: "Cá nhân",
  Business: "Doanh nghiệp",
};

export const ORDER_REQUEST_STATUS_LABELS: Record<string, string> = {
  New: "Mới",
  Contacted: "Đã liên hệ",
  Confirmed: "Đã xác nhận",
  Paid: "Đã thanh toán",
  Provisioning: "Đang triển khai",
  Cancelled: "Đã huỷ",
  Completed: "Hoàn tất",
};

export const CONSULTATION_STATUS_LABELS: Record<string, string> = {
  New: "Mới",
  Contacted: "Đã liên hệ",
  Resolved: "Đã xử lý",
  Closed: "Đã đóng",
};

export const AFFILIATE_APPLICATION_STATUS_LABELS: Record<string, string> = {
  Pending: "Chờ duyệt",
  Approved: "Đã duyệt",
  Rejected: "Từ chối",
};

export const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  Percentage: "Giảm theo %",
  FixedAmount: "Giảm số tiền cố định",
};

export const SCOPE_TYPE_LABELS: Record<string, string> = {
  All: "Toàn bộ",
  Category: "Theo danh mục",
  Plan: "Theo gói dịch vụ",
};

export const SERVICE_PLAN_STATUS_LABELS: Record<string, string> = {
  Draft: "Bản nháp",
  Active: "Đang bán",
  OutOfStock: "Tạm hết hàng",
  Archived: "Đã khai tử",
  Deprecated: "Ngừng bán mới",
};

// Mô tả ngắn cho mỗi trạng thái - hiển thị trong dropdown chọn Status ở ServicePlanForm để Admin
// hiểu rõ khác biệt giữa Archived (chặn cả gia hạn) và Deprecated (khách cũ vẫn gia hạn được).
export const SERVICE_PLAN_STATUS_DESCRIPTIONS: Record<string, string> = {
  Draft: "Đang soạn thảo, chưa hiển thị công khai.",
  Active: "Hiển thị công khai, khách mua mới bình thường.",
  OutOfStock: "Ẩn khỏi mua mới (Admin tự bật khi hết hạ tầng), khách cũ vẫn gia hạn được.",
  Archived: "Ngừng hẳn - chặn cả mua mới lẫn gia hạn.",
  Deprecated: "Ẩn khỏi khách mới, nhưng khách đã mua vẫn gia hạn được với giá cũ.",
};

export const ADDON_TYPE_LABELS: Record<string, string> = {
  Ip: "IP tĩnh",
  Disk: "Ổ đĩa bổ sung",
  Bandwidth: "Băng thông",
  License: "Bản quyền phần mềm",
  ManagedService: "Dịch vụ quản trị",
};

export const ADDON_BILLING_TYPE_LABELS: Record<string, string> = {
  FlatFee: "Giá cố định",
  PerUnit: "Theo đơn vị",
};

export const SERVICE_PLAN_PACKAGE_TYPE_LABELS: Record<string, string> = {
  Fixed: "Gói cố định",
  Custom: "Gói tuỳ biến (kéo thanh trượt)",
};

export const OS_FAMILY_LABELS: Record<string, string> = {
  Linux: "Linux",
  Windows: "Windows Server",
};

export const PROMOTION_CUSTOMER_ELIGIBILITY_LABELS: Record<string, string> = {
  All: "Tất cả khách hàng",
  NewCustomersOnly: "Chỉ khách hàng mới",
  ExistingCustomersOnly: "Chỉ khách hàng đã mua",
};
