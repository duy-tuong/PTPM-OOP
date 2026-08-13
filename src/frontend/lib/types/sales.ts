import type { CustomerType } from "./enums";

// Khớp Application/Features/Sales/OrderRequests/Dtos/*.cs
export interface CreateOrderRequestDto {
  customerType: CustomerType;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  taxCode?: string;
  servicePlanId?: number;
  tldPricingId?: number;
  periodMonths?: number;
  promotionId?: number;
  quantity: number;
  note?: string;
}

export interface OrderRequestDto {
  id: number;
  orderCode: string;
  status: string;
  totalPrice: number;
  createdAt: string;
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
