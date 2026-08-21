import { apiFetch } from "../http";
import type { AdminTestimonialDto, CreateTestimonialDto, UpdateTestimonialDto } from "@/lib/types/admin";

export function getAdminTestimonials(baseUrl: string, token?: string) {
  return apiFetch<AdminTestimonialDto[]>(baseUrl, "/admin/testimonials", "GET", { token });
}

export function createAdminTestimonial(baseUrl: string, dto: CreateTestimonialDto, token?: string) {
  return apiFetch<AdminTestimonialDto>(baseUrl, "/admin/testimonials", "POST", { body: dto, token });
}

export function updateAdminTestimonial(baseUrl: string, id: number, dto: UpdateTestimonialDto, token?: string) {
  return apiFetch<AdminTestimonialDto>(baseUrl, `/admin/testimonials/${id}`, "PUT", { body: dto, token });
}

export function deleteAdminTestimonial(baseUrl: string, id: number, token?: string) {
  return apiFetch<void>(baseUrl, `/admin/testimonials/${id}`, "DELETE", { token });
}
