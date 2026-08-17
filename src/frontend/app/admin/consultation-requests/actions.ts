"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { updateAdminConsultationRequestStatus } from "@/lib/api/admin/consultation-requests";
import type { AdminConsultationRequestDto, UpdateConsultationRequestStatusDto } from "@/lib/types/admin";

type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
}

export async function updateConsultationRequestStatusAction(
  id: number,
  dto: UpdateConsultationRequestStatusDto,
): Promise<ActionResult<AdminConsultationRequestDto>> {
  try {
    const data = await updateAdminConsultationRequestStatus(getApiUrl(), id, dto, await getToken());
    revalidatePath("/admin/consultation-requests");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}
