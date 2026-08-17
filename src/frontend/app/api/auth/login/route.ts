import { NextResponse } from "next/server";
import { loginBackend } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/http";
import { applyAdminAuthCookies } from "@/lib/auth/adminSession";
import type { LoginRequest } from "@/lib/types/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as LoginRequest;

  try {
    const result = await loginBackend(body);
    const response = NextResponse.json({ fullName: result.fullName, roles: result.roles });
    applyAdminAuthCookies(response, result);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
