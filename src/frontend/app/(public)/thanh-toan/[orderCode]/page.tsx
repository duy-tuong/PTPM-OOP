import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderByCode } from "@/lib/api/sales";
import { ApiError } from "@/lib/api/http";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { formatCurrency } from "@/lib/utils";
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
  description: "Hướng dẫn chuyển khoản và tra cứu trạng thái đơn hàng Cloudverse.",
};

export default async function PaymentInstructionsPage({
  params,
}: {
  params: Promise<{ orderCode: string }>;
}) {
  const { orderCode } = await params;
  const order = await loadOrder(orderCode);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-4xl font-bold sm:text-5xl">Thanh Toán Đơn Hàng</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Cảm ơn bạn đã đặt hàng. Vui lòng chuyển khoản theo hướng dẫn bên dưới để hoàn tất đơn hàng.
        </p>
      </div>

      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
            <p className="font-heading text-xl font-semibold text-foreground">{order.orderCode}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <ul className="flex flex-col gap-2 text-sm">
            {order.items.map((item, index) => (
              <li key={index} className="flex items-center justify-between gap-3">
                <span className="text-foreground">
                  {item.productName} x{item.quantity}
                </span>
                <span className="font-medium text-foreground">{formatCurrency(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">Tổng cộng</span>
            <span className="font-heading text-lg font-semibold text-primary">
              {formatCurrency(order.totalPrice)}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-primary/40 bg-primary/5 p-4">
          <h2 className="font-heading text-base font-semibold text-foreground">Thông tin chuyển khoản</h2>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Ngân hàng</dt>
              <dd className="font-medium text-foreground">{order.bankName}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Số tài khoản</dt>
              <dd className="font-medium text-foreground">{order.bankAccountNumber}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Chủ tài khoản</dt>
              <dd className="font-medium text-foreground">{order.bankAccountHolder}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Số tiền</dt>
              <dd className="font-medium text-foreground">{formatCurrency(order.totalPrice)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Nội dung chuyển khoản</dt>
              <dd className="font-medium text-foreground">{order.orderCode}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            Đây là thông tin chuyển khoản mô phỏng cho mục đích demo, không phải tài khoản thật. Sau khi
            ghi nhận thanh toán, đội ngũ Cloudverse sẽ xác nhận đơn và tiến hành triển khai dịch vụ.
          </p>
        </div>
      </div>
    </div>
  );
}
