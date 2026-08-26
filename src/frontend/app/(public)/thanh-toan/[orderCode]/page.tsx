import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderByCode } from "@/lib/api/sales";
import { ApiError } from "@/lib/api/http";
import { PaymentStatusPanel } from "@/components/contact/PaymentStatusPanel";
import type { OrderLookupDto } from "@/lib/types/sales";

// notFound() thật cho 404 (không âm thầm ẩn) - mirror đúng loadPlan() ở bang-gia/[slug]/page.tsx.
// Endpoint /order-requests/by-code/{code} là public/anonymous nên trang này không cần đăng nhập -
// đúng ý đồ: link trong email xác nhận đơn (OrderRequestService.CreateAsync) trỏ thẳng về đây.
async function loadOrder(orderCode: string): Promise<OrderLookupDto> {
  try {
    return await getOrderByCode(orderCode);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}

export const metadata: Metadata = {
  title: "Thanh toán đơn hàng",
  description: "Quét mã QR PayOS để thanh toán và tra cứu trạng thái đơn hàng Cloudverse.",
};

export default async function PaymentInstructionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderCode: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { orderCode } = await params;
  const { payment } = await searchParams;
  const order = await loadOrder(orderCode);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">Thanh Toán Đơn Hàng</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Cảm ơn bạn đã đặt hàng. Quét mã QR bên dưới để thanh toán qua PayOS - hệ thống tự động ghi nhận
          ngay khi hoàn tất.
        </p>
      </div>

      <PaymentStatusPanel initialOrder={order} paymentQuery={payment} />
    </div>
  );
}
