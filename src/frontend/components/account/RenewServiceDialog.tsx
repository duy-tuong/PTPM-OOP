"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import type { OrderRequestDto, MyServiceItemDto } from "@/lib/types/sales";

// Gia hạn 1 dịch vụ đã mua - tạo 1 OrderRequest mới đi lại toàn bộ chu trình có sẵn (khách vẫn
// "chuyển khoản" giả lập ở /thanh-toan/{orderCode} như đơn thường), chứ không gia hạn tức thì.
// Gói dịch vụ KHÔNG cho chọn kỳ hạn khác - luôn gia hạn đúng kỳ hạn hiện tại (không gửi periodMonths
// lên, backend tự mặc định theo item gốc). Lý do: PlanPrice chỉ cấu hình sẵn giá cho 1 số kỳ hạn cố
// định (vd 1/12 tháng) - cho chọn tự do sẽ dễ trúng kỳ hạn chưa có giá và bị backend từ chối. Tên
// miền thì khác - RenewPrice nhân trực tiếp theo số năm, không tra bảng giá cố định nên chọn tự do được.
export function RenewServiceDialog({ item }: { item: MyServiceItemDto }) {
  const router = useRouter();
  const isDomain = !!item.tldName;
  const [open, setOpen] = useState(false);
  const [years, setYears] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/order-requests/renewals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderRequestItemId: item.itemId,
          years: isDomain ? years : undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Gia hạn thất bại, vui lòng thử lại.");
      }

      const result = (await res.json()) as OrderRequestDto;
      setOpen(false);
      router.push(`/thanh-toan/${result.orderCode}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gia hạn thất bại, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>Gia hạn</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Gia hạn dịch vụ</DialogTitle>
        </DialogHeader>

        <FieldGroup className="py-4">
          {isDomain ? (
            <Field>
              <Label htmlFor="renew-years">Số năm gia hạn</Label>
              <Input
                id="renew-years"
                type="number"
                min={1}
                max={10}
                value={years}
                onChange={(e) => setYears(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
                className="h-11"
              />
            </Field>
          ) : (
            <p className="text-sm text-muted-foreground">
              Gia hạn thêm {item.periodMonths ?? "1"} tháng, đúng kỳ hạn hiện tại của gói.
            </p>
          )}
        </FieldGroup>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-full">
            {isSubmitting ? "Đang xử lý..." : "Xác nhận gia hạn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
