"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getServicePlansPublic } from "@/lib/api/catalog";
import { formatCurrency } from "@/lib/utils";
import type { MyServiceItemDto, PlanChangePreviewDto } from "@/lib/types/sales";
import type { ServicePlanListItemDto } from "@/lib/types/catalog";

// Đổi gói (Phần 6) - khác RenewServiceDialog.tsx (gia hạn CÙNG gói): dialog này cho chọn 1 gói KHÁC
// cùng danh mục, xem trước số tiền phải trả thêm/không hoàn (Preview) trước khi xác nhận (Confirm).
// Preview KHÔNG ghi gì xuống DB - backend tính lại y hệt lúc Confirm (không tin kết quả Preview cũ),
// dialog chỉ hiển thị lại cho khách xem trước. Chỉ hỗ trợ đổi giữa 2 gói Fixed (khớp phạm vi
// PlanChangeService), nên component tự lọc bỏ gói hiện tại + gói Custom khỏi danh sách chọn.
export function PlanChangeDialog({ item }: { item: MyServiceItemDto }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState<ServicePlanListItemDto[] | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [targetPlanId, setTargetPlanId] = useState<number | null>(null);
  const [preview, setPreview] = useState<PlanChangePreviewDto | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next || plans !== null || !item.servicePlanCategorySlug) return;

    setLoadingPlans(true);
    try {
      const result = await getServicePlansPublic({ categorySlug: item.servicePlanCategorySlug, pageSize: 100 });
      setPlans(result.items.filter((p) => p.id !== item.servicePlanId && p.packageType === "Fixed"));
    } catch {
      toast.error("Không tải được danh sách gói để đổi, vui lòng thử lại.");
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }

  async function handleSelectTarget(value: string | null) {
    const id = value ? Number(value) : null;
    setTargetPlanId(id);
    setPreview(null);
    setError(undefined);
    if (!id) return;

    setIsPreviewing(true);
    try {
      const res = await fetch(`/api/order-requests/items/${item.itemId}/change-plan/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPlanId: id }),
      });
      const data = (await res.json().catch(() => null)) as PlanChangePreviewDto | { message?: string } | null;
      if (!res.ok) {
        throw new Error((data as { message?: string } | null)?.message ?? "Không thể xem trước đổi gói.");
      }
      setPreview(data as PlanChangePreviewDto);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xem trước đổi gói.");
    } finally {
      setIsPreviewing(false);
    }
  }

  async function handleConfirm() {
    if (!targetPlanId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/order-requests/items/${item.itemId}/change-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPlanId }),
      });
      const data = (await res.json().catch(() => null)) as
        | { requiresPayment: boolean; orderCode?: string | null; amountDue: number }
        | { message?: string }
        | null;
      if (!res.ok) {
        throw new Error((data as { message?: string } | null)?.message ?? "Đổi gói thất bại, vui lòng thử lại.");
      }

      const result = data as { requiresPayment: boolean; orderCode?: string | null; amountDue: number };
      setOpen(false);
      if (result.requiresPayment && result.orderCode) {
        router.push(`/thanh-toan/${result.orderCode}`);
      } else {
        toast.success("Đã đổi gói dịch vụ thành công.");
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đổi gói thất bại, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>Đổi gói</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đổi gói dịch vụ</DialogTitle>
        </DialogHeader>

        <FieldGroup className="py-4">
          <Field>
            {loadingPlans ? (
              <p className="text-sm text-muted-foreground">Đang tải danh sách gói...</p>
            ) : plans && plans.length > 0 ? (
              <Select
                items={plans.map((p) => ({ value: String(p.id), label: p.name }))}
                value={targetPlanId ? String(targetPlanId) : null}
                onValueChange={handleSelectTarget}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn gói muốn đổi sang" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">Không có gói nào khác cùng danh mục để đổi.</p>
            )}
          </Field>

          {isPreviewing && <p className="text-sm text-muted-foreground">Đang tính toán chi phí...</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {preview && (
            <div className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm">
              <p className="text-foreground">
                {preview.direction === "Upgrade" ? "Nâng cấp" : "Hạ cấp"} lên <span className="font-medium">{preview.targetPlanName}</span>
              </p>
              <p className="mt-1 text-muted-foreground">
                Còn lại {preview.daysRemaining} ngày trong chu kỳ hiện tại.
              </p>
              {preview.requiresPayment ? (
                <p className="mt-2 font-medium text-primary">
                  Cần thanh toán thêm: {formatCurrency(preview.amountDue)}
                </p>
              ) : (
                <p className="mt-2 font-medium text-emerald-600">
                  Đổi ngay, không phát sinh thêm chi phí (không hoàn phần chênh lệch).
                </p>
              )}
            </div>
          )}
        </FieldGroup>

        <DialogFooter>
          <Button onClick={handleConfirm} disabled={!preview || isSubmitting} className="rounded-full">
            {isSubmitting ? "Đang xử lý..." : "Xác nhận đổi gói"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
