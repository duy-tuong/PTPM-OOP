import { NextResponse } from "next/server";
import { submitOrderRequest } from "@/lib/api/sales";
import { ApiError } from "@/lib/api/http";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";
import type { CreateOrderRequestDto } from "@/lib/types/sales";

// Proxy POST /order-requests - cùng lý do dùng Route Handler như customer-auth/change-password/route.ts:
// OrderRequestForm.tsx là Client Component, không đọc được cookie access token httpOnly, nên fetch
// same-origin vào đây để route handler đính kèm token (nếu khách đã đăng nhập) rồi gọi thẳng backend qua
// getApiUrl(). Không bắt buộc đăng nhập - nếu chưa có token, đơn vẫn tạo được (ẩn danh, như trước đây).
export async function POST(request: Request) {
  const token = await getCustomerAccessToken();
  const dto = (await request.json()) as CreateOrderRequestDto;

  try {
    const result = await submitOrderRequest(dto, token);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
