import { NextResponse } from "next/server";
import { previewPlanChange } from "@/lib/api/sales";
import { ApiError } from "@/lib/api/http";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";
import type { RequestPlanChangeDto } from "@/lib/types/sales";

// Đổi gói (Phần 6) - luôn đòi hỏi đăng nhập, mirror app/api/order-requests/renewals/route.ts.
export async function POST(request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const token = await getCustomerAccessToken();
  if (!token) {
    return NextResponse.json({ message: "Vui lòng đăng nhập để đổi gói dịch vụ." }, { status: 401 });
  }

  const { itemId } = await params;
  const dto = (await request.json()) as RequestPlanChangeDto;

  try {
    const result = await previewPlanChange(Number(itemId), dto, token);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
