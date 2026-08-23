import { redirect } from "next/navigation";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";
import { getMyOrders } from "@/lib/api/customer";
import { ApiError } from "@/lib/api/http";
import { MyOrderRow } from "@/components/account/MyOrderRow";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = { title: "Lịch sử đơn hàng" };

const PAGE_SIZE = 10;

function buildPageList(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, "...", total];
  if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default async function MyOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const token = await getCustomerAccessToken();
  if (!token) {
    redirect("/login");
  }

  const { page } = await searchParams;
  const pageNumber = Number(page) > 0 ? Number(page) : 1;

  let result;
  try {
    result = await getMyOrders({ pageNumber, pageSize: PAGE_SIZE }, token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }
    throw error;
  }

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử đơn hàng</CardTitle>
          <CardDescription>Xem lại tất cả các đơn hàng bạn đã giao dịch với Cloudverse</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {result.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-t border-border bg-muted/50 text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">Mã đơn</th>
                    <th className="px-6 py-4 font-medium">Sản phẩm</th>
                    <th className="px-6 py-4 font-medium">Thành tiền</th>
                    <th className="px-6 py-4 font-medium">Trạng thái</th>
                    <th className="px-6 py-4 font-medium">Ngày đặt</th>
                    <th className="px-6 py-4 font-medium" aria-label="Chi tiết" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.items.map((order) => (
                    <MyOrderRow key={order.id} order={order} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center border-t border-border">
              <p>Bạn chưa có đơn hàng nào.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {result.totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                text="Trước"
                href={`/khach-hang/don-hang?page=${Math.max(1, pageNumber - 1)}`}
                aria-disabled={!result.hasPreviousPage}
              />
            </PaginationItem>
            {buildPageList(pageNumber, result.totalPages).map((p, index) => (
              <PaginationItem key={`${p}-${index}`}>
                {p === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink href={`/khach-hang/don-hang?page=${p}`} isActive={p === pageNumber}>
                    {p}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                text="Sau"
                href={`/khach-hang/don-hang?page=${Math.min(result.totalPages, pageNumber + 1)}`}
                aria-disabled={!result.hasNextPage}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
