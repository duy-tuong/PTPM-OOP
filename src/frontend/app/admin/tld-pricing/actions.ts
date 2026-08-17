"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import {
  createAdminTldPricing,
  updateAdminTldPricing,
  deleteAdminTldPricing,
} from "@/lib/api/admin/tld-pricing";
import type { AdminTldPricingDto, CreateTldPricingDto, UpdateTldPricingDto } from "@/lib/types/admin";

type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
}

export async function createTldPricingAction(
  dto: CreateTldPricingDto,
): Promise<ActionResult<AdminTldPricingDto>> {
  try {
    const data = await createAdminTldPricing(getApiUrl(), dto, await getToken());
    revalidatePath("/admin/tld-pricing");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function updateTldPricingAction(
  id: number,
  dto: UpdateTldPricingDto,
): Promise<ActionResult<AdminTldPricingDto>> {
  try {
    const data = await updateAdminTldPricing(getApiUrl(), id, dto, await getToken());
    revalidatePath("/admin/tld-pricing");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function deleteTldPricingAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteAdminTldPricing(getApiUrl(), id, await getToken());
    revalidatePath("/admin/tld-pricing");
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}
