import { apiFetch } from "../http";
import type { PagedResult } from "@/lib/types/common";
import type { AdminNewsCommentDto, NewsCommentQueryParams, UpdateNewsCommentApprovalDto } from "@/lib/types/admin";

export function getAdminNewsComments(baseUrl: string, params: NewsCommentQueryParams = {}, token?: string) {
  return apiFetch<PagedResult<AdminNewsCommentDto>>(baseUrl, "/admin/news-comments", "GET", { params, token });
}

export function updateAdminNewsCommentApproval(
  baseUrl: string,
  id: number,
  dto: UpdateNewsCommentApprovalDto,
  token?: string,
) {
  return apiFetch<AdminNewsCommentDto>(baseUrl, `/admin/news-comments/${id}/approval`, "PUT", { body: dto, token });
}

export function deleteAdminNewsComment(baseUrl: string, id: number, token?: string) {
  return apiFetch<void>(baseUrl, `/admin/news-comments/${id}`, "DELETE", { token });
}
