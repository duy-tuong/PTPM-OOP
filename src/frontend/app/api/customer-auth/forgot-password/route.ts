import { NextResponse } from "next/server";
import { forgotPassword } from "@/lib/api/customerAuth";
import type { ForgotPasswordRequest } from "@/lib/types/customerAuth";

// Proxy POST /customer-auth/forgot-password - anonymous, chỉ cần proxy server-to-server (không cần
// cookie). Luôn trả 200 kể cả email không tồn tại - backend đã tự đảm bảo không lộ thông tin.
export async function POST(request: Request) {
  const dto = (await request.json()) as ForgotPasswordRequest;
  await forgotPassword(dto);
  return NextResponse.json({ success: true });
}
