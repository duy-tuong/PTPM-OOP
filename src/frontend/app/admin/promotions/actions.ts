"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { createAdminPromotion, updateAdminPromotion, deleteAdminPromotion } from "@/lib/api/admin/promotions";
import type { AdminPromotionDto, CreatePromotionDto, UpdatePromotionDto } from "@/lib/types/admin";

type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
}

export async function createPromotionAction(dto: CreatePromotionDto): Promise<ActionResult<AdminPromotionDto>> {
  try {
    const data = await createAdminPromotion(getApiUrl(), dto, await getToken());
    revalidatePath("/admin/promotions");
    revalidatePath("/", "layout");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function updatePromotionAction(
  id: number,
  dto: UpdatePromotionDto,
): Promise<ActionResult<AdminPromotionDto>> {
  try {
    const data = await updateAdminPromotion(getApiUrl(), id, dto, await getToken());
    revalidatePath("/admin/promotions");
    revalidatePath("/", "layout");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function deletePromotionAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteAdminPromotion(getApiUrl(), id, await getToken());
    revalidatePath("/admin/promotions");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}
