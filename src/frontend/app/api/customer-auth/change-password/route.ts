import { NextResponse } from "next/server";
import { changeMyPassword } from "@/lib/api/customer";
import { ApiError } from "@/lib/api/http";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";
import type { ChangeCustomerPasswordDto } from "@/lib/types/customerAuth";

// Proxy POST /customer-auth/change-password - cùng lý do dùng Route Handler như me/route.ts. Backend
// tự null hoá RefreshToken sau khi đổi mật khẩu thành công - ChangePasswordForm.tsx chịu trách nhiệm
// gọi tiếp /api/customer-auth/logout để xoá cookie phía client cho nhất quán trạng thái.
export async function POST(request: Request) {
  const token = await getCustomerAccessToken();
  if (!token) {
    return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
  }

  const dto = (await request.json()) as ChangeCustomerPasswordDto;

  try {
    await changeMyPassword(dto, token);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
