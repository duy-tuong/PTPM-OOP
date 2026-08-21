import { NextResponse } from "next/server";
import { updateMyProfile } from "@/lib/api/customer";
import { ApiError } from "@/lib/api/http";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";
import type { UpdateCustomerProfileDto } from "@/lib/types/customerAuth";

// Proxy PUT /customer-auth/me - ProfileForm.tsx là Client Component không đọc được cookie httpOnly
// customer_access_token, phải qua Route Handler same-origin này (đọc cookie server-side rồi gọi
// backend kèm Bearer token) - khác 3 form ẩn danh ở lib/api/sales.ts (không cần token nên gọi thẳng).
export async function PUT(request: Request) {
  const token = await getCustomerAccessToken();
  if (!token) {
    return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
  }

  const dto = (await request.json()) as UpdateCustomerProfileDto;

  try {
    const result = await updateMyProfile(dto, token);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
