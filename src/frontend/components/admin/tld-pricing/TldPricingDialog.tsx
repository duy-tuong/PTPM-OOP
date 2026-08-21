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
import { createTldPricingAction, updateTldPricingAction } from "@/app/admin/tld-pricing/actions";
import type { AdminServiceCategoryDto, AdminTldPricingDto } from "@/lib/types/admin";

interface TldPricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: AdminTldPricingDto | null;
  categories: AdminServiceCategoryDto[];
}

interface FormState {
  tld: string;
  serviceCategoryId: number | null;
  registerPrice: number;
  renewPrice: number;
  transferPrice: number;
  currency: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  tld: "",
  serviceCategoryId: null,
  registerPrice: 0,
  renewPrice: 0,
  transferPrice: 0,
  currency: "VND",
  isActive: true,
};

const NO_CATEGORY_VALUE = "none";

interface FormErrors {
  tld?: string;
}

export function TldPricingDialog({ open, onOpenChange, item, categories }: TldPricingDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function syncForm() {
      if (!open) return;
      if (item) {
        setForm({
          tld: item.tld,
          serviceCategoryId: item.serviceCategoryId ?? null,
          registerPrice: item.registerPrice,
          renewPrice: item.renewPrice,
          transferPrice: item.transferPrice,
          currency: item.currency,
          isActive: item.isActive,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
    syncForm();
  }, [open, item]);

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!form.tld.trim()) nextErrors.tld = "Vui lòng nhập đuôi tên miền";
    else if (form.tld.length > 20) nextErrors.tld = "Tối đa 20 ký tự";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const dto = {
        tld: form.tld.trim(),
        serviceCategoryId: form.serviceCategoryId ?? undefined,
        registerPrice: form.registerPrice,
        renewPrice: form.renewPrice,
        transferPrice: form.transferPrice,
        currency: form.currency.trim() || "VND",
        isActive: form.isActive,
      };

      const result = item ? await updateTldPricingAction(item.id, dto) : await createTldPricingAction(dto);

      if (!result.success) {
        if (result.message.includes("Tên miền")) {
          setErrors((prev) => ({ ...prev, tld: result.message }));
        } else {
          toast.error(result.message);
        }
        return;
      }

      toast.success(item ? "Đã cập nhật bảng giá" : "Đã thêm tên miền mới");
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
            <DialogTitle>{item ? "Sửa bảng giá tên miền" : "Thêm tên miền"}</DialogTitle>
          </DialogHeader>

          <FieldGroup className="py-4">
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="tld-value">Đuôi tên miền</Label>
                <Input
                  id="tld-value"
                  value={form.tld}
                  onChange={(e) => setForm((prev) => ({ ...prev, tld: e.target.value }))}
                  placeholder=".com"
                  aria-invalid={!!errors.tld}
                />
                <FieldError errors={errors.tld ? [{ message: errors.tld }] : undefined} />
              </Field>

              <Field>
                <Label htmlFor="tld-currency">Đơn vị tiền tệ</Label>
                <Input
                  id="tld-currency"
                  value={form.currency}
                  onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                  maxLength={3}
                />
              </Field>
            </div>

            <Field>
              <Label htmlFor="tld-category">Danh mục dịch vụ</Label>
              <Select
                value={form.serviceCategoryId ? String(form.serviceCategoryId) : NO_CATEGORY_VALUE}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    serviceCategoryId: value === NO_CATEGORY_VALUE ? null : Number(value),
                  }))
                }
              >
                <SelectTrigger id="tld-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY_VALUE}>Không thuộc danh mục</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="grid grid-cols-3 gap-3">
              <Field>
                <Label htmlFor="tld-register-price">Giá đăng ký</Label>
                <Input
                  id="tld-register-price"
                  type="number"
                  min={0}
                  value={form.registerPrice}
                  onChange={(e) => setForm((prev) => ({ ...prev, registerPrice: Number(e.target.value) }))}
                />
              </Field>

              <Field>
                <Label htmlFor="tld-renew-price">Giá gia hạn</Label>
                <Input
                  id="tld-renew-price"
                  type="number"
                  min={0}
                  value={form.renewPrice}
                  onChange={(e) => setForm((prev) => ({ ...prev, renewPrice: Number(e.target.value) }))}
                />
              </Field>

              <Field>
                <Label htmlFor="tld-transfer-price">Giá chuyển đổi</Label>
                <Input
                  id="tld-transfer-price"
                  type="number"
                  min={0}
                  value={form.transferPrice}
                  onChange={(e) => setForm((prev) => ({ ...prev, transferPrice: Number(e.target.value) }))}
                />
              </Field>
            </div>

            <label
              htmlFor="tld-active"
              className="flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-700"
            >
              <div className="relative flex items-center">
                <input
                  id="tld-active"
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
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-zinc-900 px-6 text-white hover:bg-zinc-800"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu bảng giá"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
