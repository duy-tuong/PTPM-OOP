import { NextResponse } from "next/server";
import { markMyNotificationAsRead } from "@/lib/api/customer";
import { ApiError } from "@/lib/api/http";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";

// Proxy POST /customer/notifications/{id}/read - đánh dấu 1 thông báo đã đọc (bấm vào item trong
// dropdown chuông).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getCustomerAccessToken();
  if (!token) {
    return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
  }

  const { id } = await params;

  try {
    await markMyNotificationAsRead(Number(id), token);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
