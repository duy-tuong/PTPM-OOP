"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import {
  createAdminTestimonial,
  updateAdminTestimonial,
  deleteAdminTestimonial,
} from "@/lib/api/admin/testimonials";
import type { AdminTestimonialDto, CreateTestimonialDto, UpdateTestimonialDto } from "@/lib/types/admin";

type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
}

export async function createTestimonialAction(
  dto: CreateTestimonialDto,
): Promise<ActionResult<AdminTestimonialDto>> {
  try {
    const data = await createAdminTestimonial(getApiUrl(), dto, await getToken());
    revalidatePath("/admin/testimonials");
    revalidateTag("testimonials");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function updateTestimonialAction(
  id: number,
  dto: UpdateTestimonialDto,
): Promise<ActionResult<AdminTestimonialDto>> {
  try {
    const data = await updateAdminTestimonial(getApiUrl(), id, dto, await getToken());
    revalidatePath("/admin/testimonials");
    revalidateTag("testimonials");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function deleteTestimonialAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteAdminTestimonial(getApiUrl(), id, await getToken());
    revalidatePath("/admin/testimonials");
    revalidateTag("testimonials");
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}
