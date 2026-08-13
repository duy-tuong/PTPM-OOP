import { apiFetch } from "../http";
import type { PagedResult } from "@/lib/types/common";
import type {
  AdminNewsArticleDto,
  AdminNewsArticleQueryParams,
  CreateNewsArticleDto,
  UpdateNewsArticleDto,
} from "@/lib/types/admin";

export function getAdminNewsArticles(baseUrl: string, params: AdminNewsArticleQueryParams = {}, token?: string) {
  return apiFetch<PagedResult<AdminNewsArticleDto>>(baseUrl, "/admin/news-articles", "GET", { params, token });
}

export function getAdminNewsArticleById(baseUrl: string, id: number, token?: string) {
  return apiFetch<AdminNewsArticleDto>(baseUrl, `/admin/news-articles/${id}`, "GET", { token });
}

export function createAdminNewsArticle(baseUrl: string, dto: CreateNewsArticleDto, token?: string) {
  return apiFetch<AdminNewsArticleDto>(baseUrl, "/admin/news-articles", "POST", { body: dto, token });
}

export function updateAdminNewsArticle(baseUrl: string, id: number, dto: UpdateNewsArticleDto, token?: string) {
  return apiFetch<AdminNewsArticleDto>(baseUrl, `/admin/news-articles/${id}`, "PUT", { body: dto, token });
}

export function deleteAdminNewsArticle(baseUrl: string, id: number, token?: string) {
  return apiFetch<void>(baseUrl, `/admin/news-articles/${id}`, "DELETE", { token });
}
