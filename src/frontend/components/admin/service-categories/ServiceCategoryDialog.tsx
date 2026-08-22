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
import { slugify } from "@/lib/utils";
import { createServiceCategoryAction, updateServiceCategoryAction } from "@/app/admin/service-categories/actions";
import type { AdminServiceCategoryDto } from "@/lib/types/admin";

interface ServiceCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: AdminServiceCategoryDto | null;
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  iconUrl: string;
  displayOrder: number;
  isActive: boolean;
}

const EMPTY_FORM: FormState = { name: "", slug: "", description: "", iconUrl: "", displayOrder: 0, isActive: true };

interface FormErrors {
  name?: string;
  slug?: string;
  description?: string;
  iconUrl?: string;
}

export function ServiceCategoryDialog({ open, onOpenChange, category }: ServiceCategoryDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function syncForm() {
      if (!open) return;
      if (category) {
        setForm({
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          iconUrl: category.iconUrl ?? "",
          displayOrder: category.displayOrder,
          isActive: category.isActive,
        });
        setSlugTouched(true);
      } else {
        setForm(EMPTY_FORM);
        setSlugTouched(false);
      }
      setErrors({});
    }
    syncForm();
  }, [open, category]);

  function handleNameChange(value: string) {
    setForm((prev) => ({ ...prev, name: value, slug: slugTouched ? prev.slug : slugify(value) }));
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!form.name.trim()) nextErrors.name = "Vui lòng nhập tên danh mục";
    else if (form.name.length > 100) nextErrors.name = "Tên tối đa 100 ký tự";
    if (!form.slug.trim()) nextErrors.slug = "Vui lòng nhập slug";
    else if (form.slug.length > 120) nextErrors.slug = "Slug tối đa 120 ký tự";
    if (form.description.length > 2000) nextErrors.description = "Mô tả tối đa 2000 ký tự";
    if (form.iconUrl.length > 500) nextErrors.iconUrl = "URL tối đa 500 ký tự";
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
        description: form.description.trim() || undefined,
        iconUrl: form.iconUrl.trim() || undefined,
        displayOrder: form.displayOrder,
        isActive: form.isActive,
      };

      const result = category
        ? await updateServiceCategoryAction(category.id, dto)
        : await createServiceCategoryAction(dto);

      if (!result.success) {
        if (result.message.includes("Slug")) {
          setErrors((prev) => ({ ...prev, slug: result.message }));
        } else {
          toast.error(result.message);
        }
        return;
      }

      toast.success(category ? "Đã cập nhật danh mục" : "Đã thêm danh mục mới");
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
            <DialogTitle>{category ? "Sửa danh mục dịch vụ" : "Thêm danh mục dịch vụ"}</DialogTitle>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field>
              <Label htmlFor="category-name">Tên danh mục</Label>
              <Input
                id="category-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                aria-invalid={!!errors.name}
              />
              <FieldError errors={errors.name ? [{ message: errors.name }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="category-slug">Slug</Label>
              <Input
                id="category-slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((prev) => ({ ...prev, slug: e.target.value }));
                }}
                aria-invalid={!!errors.slug}
              />
              <FieldError errors={errors.slug ? [{ message: errors.slug }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="category-description">Mô tả</Label>
              <Textarea
                id="category-description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                aria-invalid={!!errors.description}
              />
              <FieldError errors={errors.description ? [{ message: errors.description }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="category-icon">URL biểu tượng</Label>
              <Input
                id="category-icon"
                value={form.iconUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, iconUrl: e.target.value }))}
                placeholder="https://..."
                aria-invalid={!!errors.iconUrl}
              />
              <FieldError errors={errors.iconUrl ? [{ message: errors.iconUrl }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="category-order">Thứ tự hiển thị</Label>
              <Input
                id="category-order"
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: Number(e.target.value) }))}
              />
            </Field>

            <label
              htmlFor="category-active"
              className="flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-700"
            >
              <div className="relative flex items-center">
                <input
                  id="category-active"
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
              {isSubmitting ? "Đang lưu..." : "Lưu danh mục"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
