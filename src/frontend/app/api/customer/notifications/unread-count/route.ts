import { NextResponse } from "next/server";
import { getMyUnreadNotificationCount } from "@/lib/api/customer";
import { ApiError } from "@/lib/api/http";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";

// Proxy GET /customer/notifications/unread-count - poll riêng (nhẹ hơn tải cả list) để cập nhật badge
// số trên chuông Navbar mà không cần mở dropdown.
export async function GET() {
  const token = await getCustomerAccessToken();
  if (!token) {
    return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
  }

  try {
    const result = await getMyUnreadNotificationCount(token);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
