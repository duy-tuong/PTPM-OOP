"use client";

import { useState, type KeyboardEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CUSTOMER_TYPE_LABELS } from "@/lib/types/enums";
import type { AdminUserDto } from "@/lib/types/admin";

const ALL_TYPE_VALUE = "all-type";
const ALL_SALES_REP_VALUE = "all-sales-rep";

interface CustomersFilterBarProps {
  currentSearch?: string;
  currentCustomerType?: string;
  currentSalesRepUserId?: string;
  // CRM: Hồ sơ B2B & Sales Rep (Đợt 2, Phần 10) - danh sách nhân viên cho select filter, page.tsx tự
  // fetch qua GET /admin/users (đã dùng chung cho trang Nhân viên + CustomerDetailForm).
  salesReps: AdminUserDto[];
}

// Mirror AuditLogsFilterBar.tsx cho phần Search (Email/FullName tự do, Enter để áp dụng) + thêm 2
// filter Select (CustomerType/Sales phụ trách, Phần 10) mirror OrderRequestsFilterBar.tsx.
export function CustomersFilterBar({ currentSearch, currentCustomerType, currentSalesRepUserId, salesReps }: CustomersFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(currentSearch ?? "");

  function updateParam(key: string, paramValue: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (paramValue) next.set(key, paramValue);
    else next.delete(key);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      updateParam("search", value.trim() || null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tìm theo email hoặc tên... Enter"
          className="rounded-full bg-white pl-9 shadow-none ring-1 ring-zinc-950/5"
        />
      </div>

      <Select
        items={[
          { value: ALL_TYPE_VALUE, label: "Tất cả loại khách hàng" },
          ...Object.entries(CUSTOMER_TYPE_LABELS).map(([key, label]) => ({ value: key, label })),
        ]}
        value={currentCustomerType ?? ALL_TYPE_VALUE}
        onValueChange={(v) => updateParam("customerType", v === ALL_TYPE_VALUE ? null : v)}
      >
        <SelectTrigger className="w-[180px] rounded-full bg-white border-zinc-200/60 shadow-none ring-1 ring-zinc-950/5 hover:bg-zinc-50">
          <SelectValue placeholder="Tất cả loại khách hàng" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_TYPE_VALUE}>Tất cả loại khách hàng</SelectItem>
          {Object.entries(CUSTOMER_TYPE_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={[
          { value: ALL_SALES_REP_VALUE, label: "Tất cả Sales" },
          ...salesReps.map((u) => ({ value: u.id, label: u.fullName })),
        ]}
        value={currentSalesRepUserId ?? ALL_SALES_REP_VALUE}
        onValueChange={(v) => updateParam("salesRepUserId", v === ALL_SALES_REP_VALUE ? null : v)}
      >
        <SelectTrigger className="w-[180px] rounded-full bg-white border-zinc-200/60 shadow-none ring-1 ring-zinc-950/5 hover:bg-zinc-50">
          <SelectValue placeholder="Tất cả Sales" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_SALES_REP_VALUE}>Tất cả Sales</SelectItem>
          {salesReps.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.fullName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
