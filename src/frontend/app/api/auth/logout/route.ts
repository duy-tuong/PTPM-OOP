import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logoutBackend } from "@/lib/api/auth";
import { ADMIN_ACCESS_TOKEN_COOKIE, clearAdminAuthCookies } from "@/lib/auth/adminSession";

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;

  if (accessToken) {
    try {
      await logoutBackend(accessToken);
    } catch {
      // Access token có thể đã hết hạn - vẫn tiếp tục xoá cookie phía client bình thường.
    }
  }

  const response = NextResponse.json({ success: true });
  clearAdminAuthCookies(response);
  return response;
}
