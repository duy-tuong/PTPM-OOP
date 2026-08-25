"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAddonAction, updateAddonAction } from "@/app/admin/addons/actions";
import { AddonType, AddonBillingType, ADDON_TYPE_LABELS, ADDON_BILLING_TYPE_LABELS } from "@/lib/types/enums";
import type { AdminAddonDto } from "@/lib/types/admin";

interface AddonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addon: AdminAddonDto | null;
}

interface FormState {
  name: string;
  sku: string;
  type: AddonType;
  billingType: AddonBillingType;
  unitName: string;
  pricePerMonth: number;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  name: "",
  sku: "",
  type: AddonType.Ip,
  billingType: AddonBillingType.PerUnit,
  unitName: "",
  pricePerMonth: 0,
  isActive: true,
};

interface FormErrors {
  name?: string;
  sku?: string;
  pricePerMonth?: string;
}

const TYPE_OPTIONS = Object.entries(AddonType)
  .filter(([, value]) => typeof value === "number")
  .map(([key, value]) => ({ value: String(value), label: ADDON_TYPE_LABELS[key] ?? key }));

const BILLING_TYPE_OPTIONS = Object.entries(AddonBillingType)
  .filter(([, value]) => typeof value === "number")
  .map(([key, value]) => ({ value: String(value), label: ADDON_BILLING_TYPE_LABELS[key] ?? key }));

export function AddonDialog({ open, onOpenChange, addon }: AddonDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function syncForm() {
      if (!open) return;
      if (addon) {
        setForm({
          name: addon.name,
          sku: addon.sku,
          type: (AddonType[addon.type as keyof typeof AddonType] ?? AddonType.Ip) as AddonType,
          billingType: (AddonBillingType[addon.billingType as keyof typeof AddonBillingType] ?? AddonBillingType.PerUnit) as AddonBillingType,
          unitName: addon.unitName ?? "",
          pricePerMonth: addon.pricePerMonth,
          isActive: addon.isActive,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
    syncForm();
  }, [open, addon]);

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!form.name.trim()) nextErrors.name = "Vui lòng nhập tên addon";
    else if (form.name.length > 100) nextErrors.name = "Tên tối đa 100 ký tự";
    if (!form.sku.trim()) nextErrors.sku = "Vui lòng nhập mã SKU";
    else if (form.sku.length > 64) nextErrors.sku = "SKU tối đa 64 ký tự";
    if (!Number.isFinite(form.pricePerMonth) || form.pricePerMonth < 0) nextErrors.pricePerMonth = "Giá không được âm";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const dto = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        type: form.type,
        billingType: form.billingType,
        unitName: form.unitName.trim() || undefined,
        pricePerMonth: form.pricePerMonth,
        isActive: form.isActive,
      };

      const result = addon ? await updateAddonAction(addon.id, dto) : await createAddonAction(dto);

      if (!result.success) {
        if (result.message.includes("Sku")) setErrors((prev) => ({ ...prev, sku: result.message }));
        else toast.error(result.message);
        return;
      }

      toast.success(addon ? "Đã cập nhật addon" : "Đã thêm addon mới");
      onOpenChange(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[24px]">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{addon ? "Sửa addon" : "Thêm addon mới"}</DialogTitle>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field>
              <Label htmlFor="addon-name">Tên addon</Label>
              <Input
                id="addon-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="VD: IPv4 phụ"
                aria-invalid={!!errors.name}
              />
              <FieldError errors={errors.name ? [{ message: errors.name }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="addon-sku">Mã SKU</Label>
              <Input
                id="addon-sku"
                value={form.sku}
                onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
                placeholder="VD: ADDON-IP-V4"
                aria-invalid={!!errors.sku}
              />
              <FieldError errors={errors.sku ? [{ message: errors.sku }] : undefined} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <Label htmlFor="addon-type">Loại</Label>
                <Select
                  items={TYPE_OPTIONS}
                  value={String(form.type)}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, type: Number(value) as AddonType }))}
                >
                  <SelectTrigger id="addon-type" className="w-full">
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <Label htmlFor="addon-billing-type">Cách tính giá</Label>
                <Select
                  items={BILLING_TYPE_OPTIONS}
                  value={String(form.billingType)}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, billingType: Number(value) as AddonBillingType }))}
                >
                  <SelectTrigger id="addon-billing-type" className="w-full">
                    <SelectValue placeholder="Chọn cách tính giá" />
                  </SelectTrigger>
                  <SelectContent>
                    {BILLING_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <Label htmlFor="addon-unit">Đơn vị (tuỳ chọn)</Label>
                <Input
                  id="addon-unit"
                  value={form.unitName}
                  onChange={(e) => setForm((prev) => ({ ...prev, unitName: e.target.value }))}
                  placeholder="VD: GB, IP"
                />
              </Field>

              <Field>
                <Label htmlFor="addon-price">Đơn giá / tháng (VNĐ)</Label>
                <Input
                  id="addon-price"
                  type="number"
                  min={0}
                  value={form.pricePerMonth}
                  onChange={(e) => setForm((prev) => ({ ...prev, pricePerMonth: Number(e.target.value) }))}
                  aria-invalid={!!errors.pricePerMonth}
                />
                <FieldError errors={errors.pricePerMonth ? [{ message: errors.pricePerMonth }] : undefined} />
              </Field>
            </div>

            <label
              htmlFor="addon-active"
              className="flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-700"
            >
              <div className="relative flex items-center">
                <input
                  id="addon-active"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-zinc-200 transition-colors peer-checked:bg-emerald-600 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-600/20" />
                <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
              </div>
              Đang hoạt động
            </label>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="rounded-full bg-zinc-900 px-6 text-white hover:bg-zinc-800">
              {isSubmitting ? "Đang lưu..." : "Lưu addon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
