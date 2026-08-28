import { NextResponse } from "next/server";
import { markAllMyNotificationsAsRead } from "@/lib/api/customer";
import { ApiError } from "@/lib/api/http";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";

// Proxy POST /customer/notifications/read-all - nút "Đánh dấu tất cả đã đọc" trong dropdown chuông.
export async function POST() {
  const token = await getCustomerAccessToken();
  if (!token) {
    return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
  }

  try {
    await markAllMyNotificationsAsRead(token);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
