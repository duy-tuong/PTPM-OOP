import { NextResponse } from "next/server";
import { getMyNotifications } from "@/lib/api/customer";
import { ApiError } from "@/lib/api/http";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";

// Proxy GET /customer/notifications - NotificationBell.tsx là Client Component (poll định kỳ), không
// đọc được cookie httpOnly, mirror app/api/customer/ssh-keys/route.ts.
export async function GET() {
  const token = await getCustomerAccessToken();
  if (!token) {
    return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
  }

  try {
    const result = await getMyNotifications(token);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
