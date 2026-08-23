import { NextResponse } from "next/server";
import { submitConsultationRequest } from "@/lib/api/sales";
import { ApiError } from "@/lib/api/http";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";
import type { CreateConsultationRequestDto } from "@/lib/types/sales";

// Proxy POST /consultation-requests - cùng lý do dùng Route Handler như order-requests/route.ts:
// ConsultationRequestForm.tsx là Client Component, không đọc được cookie access token httpOnly. Khác
// order-requests/route.ts: endpoint này KHÔNG bắt buộc đăng nhập (vẫn nhận khách ẩn danh), token chỉ
// được đính kèm NẾU có để backend gán đúng CustomerId - thiếu bước này là lý do yêu cầu tư vấn của
// khách đã đăng nhập không hiện ở trang "Yêu cầu tư vấn của tôi".
export async function POST(request: Request) {
  const token = await getCustomerAccessToken();
  const dto = (await request.json()) as CreateConsultationRequestDto;

  try {
    const result = await submitConsultationRequest(dto, token);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}