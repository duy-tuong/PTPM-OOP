import type { Metadata } from "next";
import { getPromotions } from "@/lib/api/catalog";
import { safeFetch } from "@/lib/api/safe";
import { CartCheckoutPanel } from "@/components/contact/CartCheckoutPanel";

export const metadata: Metadata = {
  title: "Giỏ hàng",
  description: "Xem lại giỏ hàng và hoàn tất đặt dịch vụ Cloudverse.",
};

// Tách riêng khỏi /lien-he (vốn chỉ còn 3 tab "chọn sản phẩm" - Đặt dịch vụ/Đặt tên miền/Tư vấn, xem
// comment ở đó) - trang này CHỈ còn CartCheckoutPanel (giỏ hàng + form khách hàng + submit đơn thật).
// Mọi CTA sản phẩm (planId/tldPricingId) vẫn trỏ /lien-he như cũ (AutoAddFromQuery.tsx vẫn ở đó,
// không đổi) - khách thêm vào giỏ xong tự bấm icon giỏ hàng ở Navbar (đã đổi href sang /gio-hang) để
// qua đây thanh toán. Chỉ resolve promotionCode ở đây (không cần plans/tldPricing/categories nữa -
// CartContext tự chứa đủ dữ liệu hiển thị giỏ, xem lib/cart/CartContext.tsx).
export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ promotionCode?: string }>;
}) {
  const params = await searchParams;
  const promotions = await safeFetch(() => getPromotions({ revalidate: 300 }), []);
  const promotion = params.promotionCode ? (promotions.find((p) => p.code === params.promotionCode) ?? null) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">Giỏ Hàng Của Bạn</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Xem lại các dịch vụ đã chọn và hoàn tất thông tin để đặt hàng.
        </p>
      </div>

      <CartCheckoutPanel promotion={promotion} />
    </div>
  );
}
