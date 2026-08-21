import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logoutCustomer } from "@/lib/api/customerAuth";
import { CUSTOMER_ACCESS_TOKEN_COOKIE, clearCustomerAuthCookies } from "@/lib/auth/customerSession";

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(CUSTOMER_ACCESS_TOKEN_COOKIE)?.value;

  if (accessToken) {
    try {
      await logoutCustomer(accessToken);
    } catch {
      // Access token có thể đã hết hạn - vẫn tiếp tục xoá cookie phía client bình thường.
    }
  }

  const response = NextResponse.json({ success: true });
  clearCustomerAuthCookies(response);
  return response;
}
