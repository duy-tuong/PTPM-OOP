import { redirect } from "next/navigation";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";
import { getMyServices } from "@/lib/api/customer";
import { ApiError } from "@/lib/api/http";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { RenewServiceDialog } from "@/components/account/RenewServiceDialog";
import { PlanChangeDialog } from "@/components/account/PlanChangeDialog";
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
import { formatDate } from "@/lib/utils";
import type { MyServiceItemDto } from "@/lib/types/sales";

export const metadata = { title: "Dịch vụ đang chạy" };

const PAGE_SIZE = 10;

function buildPageList(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, "...", total];
  if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

function formatServiceName(item: MyServiceItemDto): string {
  if (item.servicePlanName) return item.servicePlanName;
  if (item.domainName && item.tldName) return `${item.domainName}${item.tldName}`;
  return "Dịch vụ";
}

// Khác /khach-hang/don-hang (lịch sử đơn/thanh toán): trang này liệt kê dịch vụ ĐANG SỐNG theo từng
// dòng (1 dòng = 1 mục MyServiceItemDto từ GET /order-requests/mine/services, đã lọc bỏ "biên lai gia
// hạn" ở tầng backend) kèm hạn dùng + nút "Gia hạn". Nút chỉ hiện khi đã có ExpiresAt (dịch vụ đã
// Completed) - gia hạn 1 đơn chưa bàn giao xong là trường hợp biên không đáng hiển thị trong UI.
export default async function MyServicesPage({
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
    result = await getMyServices({ pageNumber, pageSize: PAGE_SIZE }, token);
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
          <CardTitle>Dịch vụ đang chạy</CardTitle>
          <CardDescription>Quản lý và gia hạn các dịch vụ Cloudverse của bạn</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {result.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-t border-border bg-muted/50 text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">Dịch vụ</th>
                    <th className="px-6 py-4 font-medium">Mã đơn</th>
                    <th className="px-6 py-4 font-medium">Trạng thái đơn</th>
                    <th className="px-6 py-4 font-medium">Hạn dùng</th>
                    <th className="px-6 py-4 font-medium" aria-label="Gia hạn" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.items.map((item) => (
                    <tr key={item.itemId} className="group transition-colors hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{formatServiceName(item)}</span>
                          {(item.provisionedIpAddress || item.provisionedNameservers) && (
                            <span className="mt-1 font-mono text-xs text-muted-foreground bg-muted w-fit px-2 py-0.5 rounded-md">
                              {item.provisionedIpAddress ? `IP: ${item.provisionedIpAddress}` : `NS: ${item.provisionedNameservers}`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{item.orderCode}</td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={item.orderStatus} />
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{item.expiresAt ? formatDate(item.expiresAt) : "-"}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {item.expiresAt && item.servicePlanId && item.servicePlanPackageType === "Fixed" && (
                            <PlanChangeDialog item={item} />
                          )}
                          {item.expiresAt && <RenewServiceDialog item={item} />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center border-t border-border">
              <p>Bạn chưa có dịch vụ nào.</p>
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
                href={`/khach-hang/dich-vu?page=${Math.max(1, pageNumber - 1)}`}
                aria-disabled={!result.hasPreviousPage}
              />
            </PaginationItem>
            {buildPageList(pageNumber, result.totalPages).map((p, index) => (
              <PaginationItem key={`${p}-${index}`}>
                {p === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink href={`/khach-hang/dich-vu?page=${p}`} isActive={p === pageNumber}>
                    {p}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                text="Sau"
                href={`/khach-hang/dich-vu?page=${Math.min(result.totalPages, pageNumber + 1)}`}
                aria-disabled={!result.hasNextPage}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
