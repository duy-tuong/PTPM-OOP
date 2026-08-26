import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { incrementNewsArticleView } from "@/lib/api/content";

// Dedup ViewCount ở Route Handler (KHÔNG phải Server Component trang chi tiết /tin-tuc/[slug]) - cố ý:
// trang chi tiết dùng revalidate:900 (ISR), nếu đọc cookies() ở đó sẽ ép cả trang thành dynamic, phá
// ISR (cùng lý do đã né trong lib/auth/customerSessionClient.ts). Cookie httpOnly "nv_{articleId}",
// 30 phút - F5 liên tục trong ngưỡng này chỉ tăng view đúng 1 lần. Gọi từ ArticleViewTracker.tsx.
export async function POST(request: Request) {
  const { articleId, slug } = (await request.json()) as { articleId: number; slug: string };
  const cookieStore = await cookies();
  const cookieName = `nv_${articleId}`;

  if (cookieStore.get(cookieName)) {
    return NextResponse.json({ counted: false });
  }

  try {
    await incrementNewsArticleView(slug);
  } catch (error) {
    // Tracking phụ, không được làm hỏng trải nghiệm đọc bài - không throw, chỉ log.
    console.error("[news-view] increment failed:", error);
  }

  const response = NextResponse.json({ counted: true });
  response.cookies.set(cookieName, "1", { httpOnly: true, maxAge: 1800, sameSite: "lax", path: "/" });
  return response;
}
