import { NextResponse } from "next/server";
import { submitOrderRequest } from "@/lib/api/sales";
import { ApiError } from "@/lib/api/http";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";
import type { CreateOrderRequestDto } from "@/lib/types/sales";

// Proxy POST /order-requests - cùng lý do dùng Route Handler như customer-auth/change-password/route.ts:
// CartCheckoutPanel.tsx là Client Component, không đọc được cookie access token httpOnly, nên fetch
// same-origin vào đây để route handler đính kèm token rồi gọi thẳng backend qua getApiUrl().
// Bắt buộc đăng nhập (khớp [Authorize(Roles="Customer")] phía backend) - trả 401 ngay ở đây nếu thiếu
// token, giống hệt app/api/order-requests/renewals/route.ts.
export async function POST(request: Request) {
  const token = await getCustomerAccessToken();
  if (!token) {
    return NextResponse.json({ message: "Vui lòng đăng nhập để đặt hàng." }, { status: 401 });
  }

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
