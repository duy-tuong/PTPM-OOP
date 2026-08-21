import { NextResponse } from "next/server";
import { registerCustomer } from "@/lib/api/customerAuth";
import { ApiError } from "@/lib/api/http";
import { applyCustomerAuthCookies } from "@/lib/auth/customerSession";
import type { CustomerRegisterRequest } from "@/lib/types/customerAuth";

export async function POST(request: Request) {
  const body = (await request.json()) as CustomerRegisterRequest;

  try {
    const result = await registerCustomer(body);
    const response = NextResponse.json({ fullName: result.fullName });
    applyCustomerAuthCookies(response, result);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Đăng ký thất bại, vui lòng thử lại";
    return NextResponse.json({ message }, { status: 500 });
  }
}
