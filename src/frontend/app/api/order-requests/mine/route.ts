import { NextResponse } from "next/server";
import { getMyOrders } from "@/lib/api/customer";
import { ApiError } from "@/lib/api/http";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";

// Proxy GET /order-requests/mine - lý do dùng Route Handler y hệt app/api/order-requests/route.ts
// (POST): MyOrdersTableBody.tsx là Client Component (cần poll định kỳ để tự cập nhật trạng thái đơn,
// xem component đó), không đọc được cookie access token httpOnly, nên fetch same-origin vào đây để
// route handler đính kèm token rồi gọi thẳng backend qua getMyOrders() (đã dùng sẵn cho SSR lần đầu ở
// don-hang/page.tsx, giờ dùng lại cho polling).
export async function GET(request: Request) {
  const token = await getCustomerAccessToken();
  if (!token) {
    return NextResponse.json({ message: "Vui lòng đăng nhập." }, { status: 401 });
  }

  const url = new URL(request.url);
  const pageNumber = Number(url.searchParams.get("pageNumber")) || 1;
  const pageSize = Number(url.searchParams.get("pageSize")) || 10;

  try {
    const result = await getMyOrders({ pageNumber, pageSize }, token);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
