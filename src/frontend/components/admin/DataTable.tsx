import type { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  cell: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  emptyMessage: string;
  getRowKey: (row: T) => string | number;
}

// Bảng dùng chung cho mọi trang Admin CRUD (Phase 6.7+) - thuần trình bày, không tự quản lý phân
// trang/sort (mỗi resource tự quyết theo API thật - service-plans có PagedResult, service-categories/
// promotions thì list phẳng). Style khớp RecentOrdersTable.tsx (Phase 6.6).
export function DataTable<T>({ columns, data, emptyMessage, getRowKey }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[24px] border border-zinc-200/60 bg-white p-10 text-center shadow-sm ring-1 ring-zinc-950/5">
        <p className="text-sm font-medium text-zinc-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-zinc-200/60 bg-zinc-50/50 hover:bg-zinc-50/50">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn("h-12 px-6 text-xs font-semibold text-zinc-500", column.className)}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow 
              key={getRowKey(row)} 
              className="group/row border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors"
            >
              {columns.map((column) => (
                <TableCell key={column.key} className={cn("px-6 py-4 text-[14px] text-zinc-700", column.className)}>
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
