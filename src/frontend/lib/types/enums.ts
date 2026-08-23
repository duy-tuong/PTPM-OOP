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
