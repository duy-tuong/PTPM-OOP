import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/api/customerAuth";
import { ApiError } from "@/lib/api/http";
import type { ResetPasswordRequest } from "@/lib/types/customerAuth";

// Proxy POST /customer-auth/reset-password - anonymous, chỉ cần proxy server-to-server.
export async function POST(request: Request) {
  const dto = (await request.json()) as ResetPasswordRequest;

  try {
    await resetPassword(dto);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
