"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DiscountType } from "@/lib/types/enums";
import { createPromotionAction, updatePromotionAction } from "@/app/admin/promotions/actions";
import type { AdminPromotionDto } from "@/lib/types/admin";

interface PromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion: AdminPromotionDto | null;
}

interface FormState {
  code: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount: string;
  minOrderValue: string;
  startDate: string;
  endDate: string;
  usageLimit: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  code: "",
  name: "",
  description: "",
  discountType: DiscountType.Percentage,
  discountValue: 0,
  maxDiscountAmount: "",
  minOrderValue: "",
  startDate: "",
  endDate: "",
  usageLimit: "",
  isActive: true,
};

interface FormErrors {
  code?: string;
  name?: string;
  discountValue?: string;
  dateRange?: string;
}

function toDateInputValue(value: string): string {
  return value ? value.slice(0, 10) : "";
}

// unpaged-list-in-Dialog pattern (giống ServiceCategoryDialog) - Sửa chỉ prefill từ record đã có sẵn
// trong mảng promotions, không fetch lại.
export function PromotionDialog({ open, onOpenChange, promotion }: PromotionDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function syncForm() {
      if (!open) return;
      if (promotion) {
        setForm({
          code: promotion.code,
          name: promotion.name,
          description: promotion.description ?? "",
          discountType:
            promotion.discountType === "FixedAmount" ? DiscountType.FixedAmount : DiscountType.Percentage,
          discountValue: promotion.discountValue,
          maxDiscountAmount: promotion.maxDiscountAmount?.toString() ?? "",
          minOrderValue: promotion.minOrderValue?.toString() ?? "",
          startDate: toDateInputValue(promotion.startDate),
          endDate: toDateInputValue(promotion.endDate),
          usageLimit: promotion.usageLimit?.toString() ?? "",
          isActive: promotion.isActive,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
    syncForm();
  }, [open, promotion]);

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!form.code.trim()) nextErrors.code = "Vui lòng nhập mã khuyến mãi";
    else if (form.code.length > 50) nextErrors.code = "Mã tối đa 50 ký tự";
    if (!form.name.trim()) nextErrors.name = "Vui lòng nhập tên chương trình";
    if (form.discountValue <= 0) nextErrors.discountValue = "Giá trị giảm phải lớn hơn 0";
    if (!form.startDate || !form.endDate) {
      nextErrors.dateRange = "Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc";
    } else if (new Date(form.endDate) <= new Date(form.startDate)) {
      // Backend KHÔNG tự kiểm tra EndDate > StartDate - phải chặn ở đây.
      nextErrors.dateRange = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const dto = {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        discountType: form.discountType,
        discountValue: form.discountValue,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : undefined,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        isActive: form.isActive,
      };

      const result = promotion
        ? await updatePromotionAction(promotion.id, dto)
        : await createPromotionAction(dto);

      if (!result.success) {
        if (result.message.includes("Code") || result.message.includes("Mã")) {
          setErrors((prev) => ({ ...prev, code: result.message }));
        } else {
          toast.error(result.message);
        }
        return;
      }

      toast.success(promotion ? "Đã cập nhật khuyến mãi" : "Đã thêm khuyến mãi mới");
      onOpenChange(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{promotion ? "Sửa khuyến mãi" : "Thêm khuyến mãi"}</DialogTitle>
          </DialogHeader>

          <FieldGroup className="max-h-[70vh] overflow-y-auto py-4">
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="promotion-code">Mã khuyến mãi</Label>
                <Input
                  id="promotion-code"
                  value={form.code}
                  onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  aria-invalid={!!errors.code}
                />
                <FieldError errors={errors.code ? [{ message: errors.code }] : undefined} />
              </Field>

              <Field>
                <Label htmlFor="promotion-name">Tên chương trình</Label>
                <Input
                  id="promotion-name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  aria-invalid={!!errors.name}
                />
                <FieldError errors={errors.name ? [{ message: errors.name }] : undefined} />
              </Field>
            </div>

            <Field>
              <Label htmlFor="promotion-description">Mô tả</Label>
              <Textarea
                id="promotion-description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="promotion-discount-type">Loại giảm giá</Label>
                <Select
                  value={String(form.discountType)}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, discountType: Number(value) as DiscountType }))
                  }
                >
                  <SelectTrigger id="promotion-discount-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(DiscountType.Percentage)}>Giảm theo %</SelectItem>
                    <SelectItem value={String(DiscountType.FixedAmount)}>Giảm số tiền cố định</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <Label htmlFor="promotion-discount-value">
                  Giá trị giảm {form.discountType === DiscountType.Percentage ? "(%)" : "(VNĐ)"}
                </Label>
                <Input
                  id="promotion-discount-value"
                  type="number"
                  min={0}
                  value={form.discountValue}
                  onChange={(e) => setForm((prev) => ({ ...prev, discountValue: Number(e.target.value) }))}
                  aria-invalid={!!errors.discountValue}
                />
                <FieldError errors={errors.discountValue ? [{ message: errors.discountValue }] : undefined} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {form.discountType === DiscountType.Percentage && (
                <Field>
                  <Label htmlFor="promotion-max-discount">Giảm tối đa (VNĐ)</Label>
                  <Input
                    id="promotion-max-discount"
                    type="number"
                    min={0}
                    value={form.maxDiscountAmount}
                    onChange={(e) => setForm((prev) => ({ ...prev, maxDiscountAmount: e.target.value }))}
                    placeholder="Không giới hạn"
                  />
                </Field>
              )}

              <Field>
                <Label htmlFor="promotion-min-order">Giá trị đơn tối thiểu (VNĐ)</Label>
                <Input
                  id="promotion-min-order"
                  type="number"
                  min={0}
                  value={form.minOrderValue}
                  onChange={(e) => setForm((prev) => ({ ...prev, minOrderValue: e.target.value }))}
                  placeholder="Không yêu cầu"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="promotion-start-date">Ngày bắt đầu</Label>
                <Input
                  id="promotion-start-date"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                  aria-invalid={!!errors.dateRange}
                />
              </Field>

              <Field>
                <Label htmlFor="promotion-end-date">Ngày kết thúc</Label>
                <Input
                  id="promotion-end-date"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                  aria-invalid={!!errors.dateRange}
                />
              </Field>
            </div>
            <FieldError errors={errors.dateRange ? [{ message: errors.dateRange }] : undefined} />

            <Field>
              <Label htmlFor="promotion-usage-limit">Giới hạn lượt dùng</Label>
              <Input
                id="promotion-usage-limit"
                type="number"
                min={0}
                value={form.usageLimit}
                onChange={(e) => setForm((prev) => ({ ...prev, usageLimit: e.target.value }))}
                placeholder="Không giới hạn"
              />
            </Field>

            <label
              htmlFor="promotion-active"
              className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
            >
              <input
                id="promotion-active"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="peer sr-only"
              />
              <span className="flex size-4 items-center justify-center rounded border border-input bg-transparent transition-colors peer-checked:border-primary peer-checked:bg-primary">
                {form.isActive && <Check className="size-3 text-primary-foreground" strokeWidth={3} />}
              </span>
              Đang hoạt động
            </label>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
