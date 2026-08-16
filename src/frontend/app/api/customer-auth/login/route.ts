import { NextResponse } from "next/server";
import { loginCustomer } from "@/lib/api/customerAuth";
import { ApiError } from "@/lib/api/http";
import { applyCustomerAuthCookies } from "@/lib/auth/customerSession";
import type { CustomerLoginRequest } from "@/lib/types/customerAuth";

export async function POST(request: Request) {
  const { remember, ...body } = (await request.json()) as CustomerLoginRequest & { remember?: boolean };

  try {
    const result = await loginCustomer(body);
    const response = NextResponse.json({ fullName: result.fullName });
    applyCustomerAuthCookies(response, result, { persistent: remember ?? true });
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
