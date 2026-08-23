import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { formatOrderProductSummary } from "@/lib/utils/orderItems";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AdminOrderRequestDto } from "@/lib/types/admin";

export function RecentOrdersTable({ orders }: { orders: AdminOrderRequestDto[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-[24px] border border-zinc-200/60 bg-white p-10 text-center text-sm text-zinc-500 shadow-sm ring-1 ring-zinc-950/5">
        Chưa có đơn hàng nào.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-zinc-200/60 bg-zinc-50/50 hover:bg-zinc-50/50">
            <TableHead className="h-12 px-6 text-xs font-semibold text-zinc-500">Mã đơn</TableHead>
            <TableHead className="h-12 px-6 text-xs font-semibold text-zinc-500">Khách hàng</TableHead>
            <TableHead className="h-12 px-6 text-xs font-semibold text-zinc-500">Sản phẩm</TableHead>
            <TableHead className="h-12 px-6 text-xs font-semibold text-zinc-500">Số tiền</TableHead>
            <TableHead className="h-12 px-6 text-xs font-semibold text-zinc-500">Trạng thái</TableHead>
            <TableHead className="h-12 px-6 text-xs font-semibold text-zinc-500">Ngày tạo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors">
              <TableCell className="px-6 py-4 font-mono text-xs text-zinc-700">{order.orderCode}</TableCell>
              <TableCell className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-medium text-zinc-900">{order.customerName}</span>
                  <span className="text-xs text-zinc-500">{order.customerEmail}</span>
                </div>
              </TableCell>
              <TableCell className="px-6 py-4 text-[14px] text-zinc-700">
                {formatOrderProductSummary(order.items)}
              </TableCell>
              <TableCell className="px-6 py-4 text-[14px] text-zinc-700">{formatCurrency(order.totalPrice)}</TableCell>
              <TableCell className="px-6 py-4">
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="px-6 py-4 text-[14px] text-zinc-500">{formatDate(order.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
