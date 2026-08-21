"use client";

import { useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { TldPricingDto } from "@/lib/types/catalog";

// Tab Domain dùng UI Search + List riêng - tên miền không so sánh CPU/RAM như các danh mục kỹ thuật
// khác nên không dùng chung PricingMatrixTable. Lọc client-side (dữ liệu nhỏ, không cần debounce/API
// round-trip).
export function DomainPricingTable({ tldPricing }: { tldPricing: TldPricingDto[] }) {
  const [search, setSearch] = useState("");

  if (tldPricing.length === 0) {
    return <p className="py-16 text-center text-muted-foreground">Chưa có bảng giá tên miền nào.</p>;
  }

  const filtered = tldPricing.filter((t) => t.tld.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <div className="relative mx-auto w-full max-w-md">
        <MagnifyingGlass className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm tên miền (.com, .vn...)"
          className="pl-9"
        />
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="p-4">Tên miền</th>
              <th className="p-4">Đăng ký mới</th>
              <th className="p-4">Gia hạn</th>
              <th className="p-4">Chuyển về</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b border-border transition-colors last:border-0 hover:bg-muted/50">
                <td className="p-4 font-medium text-foreground">{t.tld}</td>
                <td className="p-4">{formatCurrency(t.registerPrice)}</td>
                <td className="p-4">{formatCurrency(t.renewPrice)}</td>
                <td className="p-4">{formatCurrency(t.transferPrice)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  Không tìm thấy tên miền phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
