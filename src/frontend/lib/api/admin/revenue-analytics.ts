import { apiFetch } from "../http";
import type {
  RevenueAnalyticsSummaryDto,
  MrrTrendPointDto,
  RevenueByProductLineDto,
  RevenueByRegionDto,
  ArAgingBucketDto,
} from "@/lib/types/admin";

export function getAdminRevenueSummary(baseUrl: string, token?: string) {
  return apiFetch<RevenueAnalyticsSummaryDto>(baseUrl, "/admin/revenue-analytics/summary", "GET", { token });
}

export function getAdminRevenueTrend(baseUrl: string, months: number, token?: string) {
  return apiFetch<MrrTrendPointDto[]>(baseUrl, "/admin/revenue-analytics/trend", "GET", { params: { months }, token });
}

export function getAdminRevenueByProductLine(baseUrl: string, token?: string) {
  return apiFetch<RevenueByProductLineDto[]>(baseUrl, "/admin/revenue-analytics/by-product-line", "GET", { token });
}

export function getAdminRevenueByRegion(baseUrl: string, token?: string) {
  return apiFetch<RevenueByRegionDto[]>(baseUrl, "/admin/revenue-analytics/by-region", "GET", { token });
}

export function getAdminArAging(baseUrl: string, token?: string) {
  return apiFetch<ArAgingBucketDto[]>(baseUrl, "/admin/revenue-analytics/ar-aging", "GET", { token });
}
