import { cookies } from "next/headers";
import type { CustomerSessionUser } from "@/lib/types/customerAuth";
import {
  CUSTOMER_ACCESS_TOKEN_COOKIE,
  CUSTOMER_REFRESH_TOKEN_COOKIE,
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_ACCESS_EXPIRES_AT_COOKIE,
  CUSTOMER_REMEMBER_COOKIE,
  applyCustomerAuthCookies,
  clearCustomerAuthCookies,
} from "@/lib/auth/customerAuthCookies";

// Re-export - hằng số + logic set/xoá cookie thật sự sống ở customerAuthCookies.ts (file đó KHÔNG import
// next/headers nên middleware Edge (proxy.ts) import được trực tiếp, khác file này). Giữ re-export ở
// đây để mọi Route Handler đang import từ customerSession.ts không phải sửa gì (Đợt 12).
export {
  CUSTOMER_ACCESS_TOKEN_COOKIE,
  CUSTOMER_REFRESH_TOKEN_COOKIE,
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_ACCESS_EXPIRES_AT_COOKIE,
  CUSTOMER_REMEMBER_COOKIE,
  applyCustomerAuthCookies,
  clearCustomerAuthCookies,
};

// Server-only - đọc cookie "customer_session" cho Server Component nào thật sự cần biết trạng thái
// đăng nhập trước khi render (vd 1 trang customer-only sau này). KHÔNG dùng ở app/(public)/layout.tsx
// dùng chung cho mọi trang public - gọi cookies() ở đó sẽ ép toàn bộ route group thành dynamic render,
// mất hết SSG/ISR (revalidate) đã cấu hình riêng từng trang. Navbar dùng
// lib/auth/customerSessionClient.ts (đọc document.cookie phía client) thay vì hàm này.
export async function getCustomerSession(): Promise<CustomerSessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as CustomerSessionUser;
    if (typeof parsed.fullName !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

// Server-only - đọc access token thật (httpOnly) để gọi các endpoint /customer-auth/me,
// /order-requests/mine,... thay mặt khách hàng. Dùng trong app/khach-hang/** (route riêng, đã bị
// proxy.ts chặn theo CUSTOMER_ACCESS_TOKEN_COOKIE trước khi tới đây) hoặc trong Route Handler dưới
// app/api/** (vd order-requests/route.ts, customer-auth/change-password/route.ts) - Route Handler vốn
// đã dynamic-per-request nên gọi cookies() ở đây không kéo theo rủi ro mất SSG như nêu ở
// getCustomerSession(). KHÔNG gọi trực tiếp trong 1 Server Component/layout dùng chung ở app/(public)/**.
export async function getCustomerAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CUSTOMER_ACCESS_TOKEN_COOKIE)?.value;
}
