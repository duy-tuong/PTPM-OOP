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
import { createOsImageAction, updateOsImageAction } from "@/app/admin/os-images/actions";
import { OsFamily, OS_FAMILY_LABELS } from "@/lib/types/enums";
import type { AdminOsImageDto } from "@/lib/types/admin";

interface OsImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  osImage: AdminOsImageDto | null;
}

interface FormState {
  name: string;
  slug: string;
  family: OsFamily;
  windowsLicenseFeePerMonth: number;
  isActive: boolean;
  displayOrder: number;
}

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  family: OsFamily.Linux,
  windowsLicenseFeePerMonth: 0,
  isActive: true,
  displayOrder: 0,
};

interface FormErrors {
  name?: string;
  slug?: string;
  windowsLicenseFeePerMonth?: string;
}

const FAMILY_OPTIONS = Object.entries(OsFamily)
  .filter(([, value]) => typeof value === "number")
  .map(([key, value]) => ({ value: String(value), label: OS_FAMILY_LABELS[key] ?? key }));

export function OsImageDialog({ open, onOpenChange, osImage }: OsImageDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function syncForm() {
      if (!open) return;
      if (osImage) {
        setForm({
          name: osImage.name,
          slug: osImage.slug,
          family: (OsFamily[osImage.family as keyof typeof OsFamily] ?? OsFamily.Linux) as OsFamily,
          windowsLicenseFeePerMonth: osImage.windowsLicenseFeePerMonth ?? 0,
          isActive: osImage.isActive,
          displayOrder: osImage.displayOrder,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
    syncForm();
  }, [open, osImage]);

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!form.name.trim()) nextErrors.name = "Vui lòng nhập tên hệ điều hành";
    else if (form.name.length > 100) nextErrors.name = "Tên tối đa 100 ký tự";
    if (!form.slug.trim()) nextErrors.slug = "Vui lòng nhập slug";
    else if (form.slug.length > 100) nextErrors.slug = "Slug tối đa 100 ký tự";
    if (form.family === OsFamily.Windows && (!Number.isFinite(form.windowsLicenseFeePerMonth) || form.windowsLicenseFeePerMonth < 0)) {
      nextErrors.windowsLicenseFeePerMonth = "Phí bản quyền không được âm";
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
        name: form.name.trim(),
        slug: form.slug.trim(),
        family: form.family,
        windowsLicenseFeePerMonth: form.family === OsFamily.Windows ? form.windowsLicenseFeePerMonth : undefined,
        isActive: form.isActive,
        displayOrder: form.displayOrder,
      };

      const result = osImage ? await updateOsImageAction(osImage.id, dto) : await createOsImageAction(dto);

      if (!result.success) {
        if (result.message.includes("Slug")) setErrors((prev) => ({ ...prev, slug: result.message }));
        else toast.error(result.message);
        return;
      }

      toast.success(osImage ? "Đã cập nhật hệ điều hành" : "Đã thêm hệ điều hành mới");
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
            <DialogTitle>{osImage ? "Sửa hệ điều hành" : "Thêm hệ điều hành mới"}</DialogTitle>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field>
              <Label htmlFor="os-image-name">Tên hệ điều hành</Label>
              <Input
                id="os-image-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="VD: Ubuntu 24.04 LTS"
                aria-invalid={!!errors.name}
              />
              <FieldError errors={errors.name ? [{ message: errors.name }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="os-image-slug">Slug</Label>
              <Input
                id="os-image-slug"
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="VD: ubuntu-24-04"
                aria-invalid={!!errors.slug}
              />
              <FieldError errors={errors.slug ? [{ message: errors.slug }] : undefined} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <Label htmlFor="os-image-family">Nhóm</Label>
                <Select
                  items={FAMILY_OPTIONS}
                  value={String(form.family)}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, family: Number(value) as OsFamily }))}
                >
                  <SelectTrigger id="os-image-family" className="w-full">
                    <SelectValue placeholder="Chọn nhóm" />
                  </SelectTrigger>
                  <SelectContent>
                    {FAMILY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <Label htmlFor="os-image-display-order">Thứ tự hiển thị</Label>
                <Input
                  id="os-image-display-order"
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: Number(e.target.value) }))}
                />
              </Field>
            </div>

            {form.family === OsFamily.Windows && (
              <Field>
                <Label htmlFor="os-image-license-fee">Phí bản quyền / tháng (VNĐ)</Label>
                <Input
                  id="os-image-license-fee"
                  type="number"
                  min={0}
                  value={form.windowsLicenseFeePerMonth}
                  onChange={(e) => setForm((prev) => ({ ...prev, windowsLicenseFeePerMonth: Number(e.target.value) }))}
                  aria-invalid={!!errors.windowsLicenseFeePerMonth}
                />
                <FieldError errors={errors.windowsLicenseFeePerMonth ? [{ message: errors.windowsLicenseFeePerMonth }] : undefined} />
                <p className="text-xs text-zinc-500">Phí cố định/tháng, cộng thẳng vào giá gói - không tính theo số core.</p>
              </Field>
            )}

            <label
              htmlFor="os-image-active"
              className="flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-700"
            >
              <div className="relative flex items-center">
                <input
                  id="os-image-active"
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
              {isSubmitting ? "Đang lưu..." : "Lưu hệ điều hành"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
