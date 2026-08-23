import type { CustomerType } from "./enums";

// Khớp Application/Features/Sales/OrderRequests/Dtos/CreateOrderRequestItemDto.cs
export interface CreateOrderRequestItemDto {
  servicePlanId?: number;
  tldPricingId?: number;
  domainName?: string;
  periodMonths?: number;
  quantity: number;
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
export interface OrderLookupItemDto {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
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

// Khớp Application/Features/Sales/ConsultationRequests/Dtos/MyConsultationRequestDto.cs
export interface MyConsultationRequestDto {
  id: number;
  requestCode: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}
