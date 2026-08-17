import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AdminOrderRequestDto } from "@/lib/types/admin";

export function RecentOrdersTable({ orders }: { orders: AdminOrderRequestDto[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
        Chưa có đơn hàng nào.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 bg-gray-50 hover:bg-gray-50">
            <TableHead className="text-xs font-medium tracking-wider text-gray-500 uppercase">Mã đơn</TableHead>
            <TableHead className="text-xs font-medium tracking-wider text-gray-500 uppercase">Khách hàng</TableHead>
            <TableHead className="text-xs font-medium tracking-wider text-gray-500 uppercase">Gói dịch vụ</TableHead>
            <TableHead className="text-xs font-medium tracking-wider text-gray-500 uppercase">Số tiền</TableHead>
            <TableHead className="text-xs font-medium tracking-wider text-gray-500 uppercase">Trạng thái</TableHead>
            <TableHead className="text-xs font-medium tracking-wider text-gray-500 uppercase">Ngày tạo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="border-gray-100">
              <TableCell className="font-mono text-xs text-gray-700">{order.orderCode}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{order.customerName}</span>
                  <span className="text-xs text-gray-500">{order.customerEmail}</span>
                </div>
              </TableCell>
              <TableCell className="text-gray-700">{order.servicePlanName ?? "-"}</TableCell>
              <TableCell className="text-gray-700">{formatCurrency(order.totalPrice)}</TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-gray-500">{formatDate(order.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
