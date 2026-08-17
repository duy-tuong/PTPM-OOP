"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/utils";

// Chỉ render khi session.roles.includes("Admin") (kiểm tra ở page.tsx) - khớp
// [Authorize(Roles="Admin")] override của action Export, khác Admin,Editor mặc định của controller.
export function ExportButton({ status }: { status?: string }) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      const query = status ? `?status=${status}` : "";
      const res = await fetch(`/api/admin/order-requests/export${query}`);
      if (!res.ok) {
        toast.error("Xuất Excel thất bại, vui lòng thử lại");
        return;
      }
      const blob = await res.blob();
      downloadBlob(blob, `don-hang-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Button
      variant="outline"
      className="rounded-full border-zinc-200/60 bg-white shadow-none ring-1 ring-zinc-950/5 hover:bg-zinc-50"
      onClick={handleExport}
      disabled={isExporting}
    >
      <Download className="size-4" data-icon="inline-start" />
      {isExporting ? "Đang xuất..." : "Xuất Excel"}
    </Button>
  );
}
