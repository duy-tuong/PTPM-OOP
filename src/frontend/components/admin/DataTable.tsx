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
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 bg-gray-50 hover:bg-gray-50">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn("text-xs font-medium tracking-wider text-gray-500 uppercase", column.className)}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={getRowKey(row)} className="border-gray-100">
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
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
