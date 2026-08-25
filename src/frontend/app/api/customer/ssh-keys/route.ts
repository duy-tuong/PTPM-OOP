import { NextResponse } from "next/server";
import { getMySshKeys, createMySshKey } from "@/lib/api/customer";
import { ApiError } from "@/lib/api/http";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";
import type { CreateSshKeyDto } from "@/lib/types/sales";

// Proxy GET/POST /customer/ssh-keys - Client Component (SshKeysManager.tsx) không đọc được cookie
// httpOnly, mirror app/api/customer-auth/change-password/route.ts.
export async function GET() {
  const token = await getCustomerAccessToken();
  if (!token) {
    return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
  }

  try {
    const result = await getMySshKeys(token);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}

export async function POST(request: Request) {
  const token = await getCustomerAccessToken();
  if (!token) {
    return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
  }

  const dto = (await request.json()) as CreateSshKeyDto;

  try {
    const result = await createMySshKey(dto, token);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
