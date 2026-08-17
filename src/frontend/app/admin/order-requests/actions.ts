"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { updateAdminOrderRequestStatus } from "@/lib/api/admin/order-requests";
import type { AdminOrderRequestDto, UpdateOrderRequestStatusDto } from "@/lib/types/admin";

type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
}

export async function updateOrderRequestStatusAction(
  id: number,
  dto: UpdateOrderRequestStatusDto,
): Promise<ActionResult<AdminOrderRequestDto>> {
  try {
    const data = await updateAdminOrderRequestStatus(getApiUrl(), id, dto, await getToken());
    revalidatePath("/admin/order-requests");
    revalidatePath("/admin/dashboard");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}
