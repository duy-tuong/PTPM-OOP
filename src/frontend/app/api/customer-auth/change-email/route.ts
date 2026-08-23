import { NextResponse } from "next/server";
import { requestEmailChange } from "@/lib/api/customer";
import { ApiError } from "@/lib/api/http";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";
import type { RequestEmailChangeDto } from "@/lib/types/customerAuth";

// Proxy POST /customer-auth/change-email/request - cùng lý do dùng Route Handler như
// customer-auth/change-password/route.ts: ProfileForm.tsx là Client Component, không đọc được cookie
// access token httpOnly.
export async function POST(request: Request) {
  const token = await getCustomerAccessToken();
  if (!token) {
    return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
  }

  const dto = (await request.json()) as RequestEmailChangeDto;

  try {
    await requestEmailChange(dto, token);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
