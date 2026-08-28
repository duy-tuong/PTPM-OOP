import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getApiUrl } from "@/lib/api/config";
import { searchAdmin } from "@/lib/api/admin/search";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { ApiError } from "@/lib/api/http";

// Route Handler proxy (mirror app/api/admin/order-requests/export/route.ts) - AdminCommandPalette.tsx
// là Client Component, không đọc được cookie access_token httpOnly, nên gọi qua đây để đính token
// server-side rồi mới proxy tiếp xuống backend thật.
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const q = request.nextUrl.searchParams.get("q") ?? "";

  try {
    const result = await searchAdmin(getApiUrl(), q, token);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
