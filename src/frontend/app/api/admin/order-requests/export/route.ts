import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getApiUrl } from "@/lib/api/config";
import { exportAdminOrderRequests } from "@/lib/api/admin/order-requests";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { ApiError } from "@/lib/api/http";
import { OrderRequestStatus } from "@/lib/types/enums";

// Route Handler binary-download đầu tiên trong dự án - Server Action không hợp để trả Blob (RSC
// serialize qua JSON), nên dùng Route Handler đọc cookie httpOnly rồi proxy file .xlsx thật từ backend.
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;

  // ExportButton gửi tên enum ("New"/"Contacted"/...) khớp cách OrderRequestsFilterBar lưu URL param -
  // đổi sang số trước khi gọi backend thật (query string .NET nhận cả 2 dạng nhưng giữ nhất quán số).
  const statusParam = request.nextUrl.searchParams.get("status");
  const status = statusParam
    ? OrderRequestStatus[statusParam as keyof typeof OrderRequestStatus]
    : undefined;

  try {
    const blob = await exportAdminOrderRequests(getApiUrl(), status, token);
    const bytes = await blob.arrayBuffer();
    const filename = `don-hang-${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
