import { NextResponse } from "next/server";
import { submitRenewalOrderRequest } from "@/lib/api/sales";
import { ApiError } from "@/lib/api/http";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";
import type { CreateRenewalOrderRequestDto } from "@/lib/types/sales";

// Khác app/api/order-requests/route.ts: gia hạn KHÔNG có luồng ẩn danh - luôn đòi hỏi đăng nhập, trả
// 401 ngay ở đây nếu thiếu token (khớp guard [Authorize(Roles="Customer")] phía backend).
export async function POST(request: Request) {
  const token = await getCustomerAccessToken();
  if (!token) {
    return NextResponse.json({ message: "Vui lòng đăng nhập để gia hạn dịch vụ." }, { status: 401 });
  }

  const dto = (await request.json()) as CreateRenewalOrderRequestDto;

  try {
    const result = await submitRenewalOrderRequest(dto, token);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
