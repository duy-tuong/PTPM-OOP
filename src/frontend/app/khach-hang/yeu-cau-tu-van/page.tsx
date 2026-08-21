import { redirect } from "next/navigation";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";
import { getMyConsultationRequests } from "@/lib/api/customer";
import { ApiError } from "@/lib/api/http";
import { ConsultationStatusBadge } from "@/components/admin/ConsultationStatusBadge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Yêu cầu tư vấn của tôi" };

const PAGE_SIZE = 10;

function buildPageList(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, "...", total];
  if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default async function MyConsultationRequestsPage({
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
    result = await getMyConsultationRequests({ pageNumber, pageSize: PAGE_SIZE }, token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }
    throw error;
  }

  return (
    <div>
      {result.items.length > 0 ? (
        <div className="flex flex-col gap-4">
          {result.items.map((request) => (
            <div key={request.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-foreground">{request.subject}</span>
                <ConsultationStatusBadge status={request.status} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{request.message}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {request.requestCode} • {formatDate(request.createdAt)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-muted-foreground">Bạn chưa gửi yêu cầu tư vấn nào.</p>
      )}

      {result.totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                text="Trước"
                href={`/khach-hang/yeu-cau-tu-van?page=${Math.max(1, pageNumber - 1)}`}
                aria-disabled={!result.hasPreviousPage}
              />
            </PaginationItem>
            {buildPageList(pageNumber, result.totalPages).map((p, index) => (
              <PaginationItem key={`${p}-${index}`}>
                {p === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink href={`/khach-hang/yeu-cau-tu-van?page=${p}`} isActive={p === pageNumber}>
                    {p}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                text="Sau"
                href={`/khach-hang/yeu-cau-tu-van?page=${Math.min(result.totalPages, pageNumber + 1)}`}
                aria-disabled={!result.hasNextPage}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
