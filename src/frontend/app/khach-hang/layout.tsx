import { redirect } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { SmoothScrollProvider } from "@/components/shared/SmoothScrollProvider";
import { AccountNav } from "@/components/account/AccountNav";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";
import { CartProvider } from "@/lib/cart/CartContext";

// Route riêng ở top-level (ngang hàng app/admin/, KHÔNG lồng trong (public)) - getCustomerSession.ts đã
// ghi rõ không được gọi cookies() ở app/(public)/layout.tsx vì sẽ ép toàn bộ trang public khác thành
// dynamic. Tự import Navbar/Footer/SmoothScrollProvider y hệt bố cục (public)/layout.tsx để giữ giao
// diện nhất quán (dùng đúng token theme Cloudverse, không copy theme zinc trơn của AdminShell.tsx).
// proxy.ts đã chặn /khach-hang/:path* theo cookie trước khi tới đây - redirect ở đây chỉ phòng hờ thêm
// (token hết hạn giữa 2 request...). Không fetch profile ở layout (tránh gọi API 2 lần cho cùng 1
// trang) - mỗi page con tự fetch đúng dữ liệu nó cần và tự xử lý 401 (xem loadProfile() ở page.tsx).
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const token = await getCustomerAccessToken();
  if (!token) {
    redirect("/login");
  }

  return (
    <CartProvider>
      <SmoothScrollProvider>
        <div className="flex min-h-full flex-1 flex-col">
          <Navbar />
          <main className="flex-1 pt-20 pb-12 bg-slate-50 dark:bg-[#070A12]">
            <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Tài khoản của tôi</h1>
                <p className="text-[15px] text-muted-foreground mt-1.5">
                  Quản lý thông tin cá nhân, bảo mật và các dịch vụ Cloudverse của bạn.
                </p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 md:gap-7">
                <aside className="w-full md:w-[240px] shrink-0">
                  <AccountNav />
                </aside>
                <div className="flex-1 min-w-0">
                  {children}
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </SmoothScrollProvider>
    </CartProvider>
  );
}
