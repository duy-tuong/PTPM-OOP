import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createNewsComment } from "@/lib/api/content";
import { ApiError } from "@/lib/api/http";
import { CUSTOMER_ACCESS_TOKEN_COOKIE } from "@/lib/auth/customerAuthCookies";
import type { CreateNewsCommentDto } from "@/lib/types/content";

// Proxy Route Handler - đúng pattern app/api/customer-auth/login/route.ts. Gọi thẳng backend từ client
// (browser) có thể vướng CORS (backend không cấu hình cho phép), nên client luôn gọi qua route same-origin
// này, route handler mới gọi backend server-to-server. Đính kèm Bearer token từ cookie httpOnly
// "customer_access_token" nếu khách đã đăng nhập - backend tự nhận diện qua User.Identity, không có thì
// coi là khách vãng lai (bắt buộc phải tự nhập tên).
export async function POST(request: Request) {
  const body = (await request.json()) as CreateNewsCommentDto;
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_ACCESS_TOKEN_COOKIE)?.value;

  try {
    const result = await createNewsComment(body, token);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
