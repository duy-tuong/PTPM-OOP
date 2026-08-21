"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { slugify } from "@/lib/utils";
import { createServicePlanAction, updateServicePlanAction } from "@/app/admin/service-plans/actions";
import type {
  AdminServiceCategoryDto,
  AdminServicePlanDto,
  PlanFeatureInputDto,
  PlanPriceInputDto,
} from "@/lib/types/admin";

interface ServicePlanFormProps {
  mode: "create" | "edit";
  initialData?: AdminServicePlanDto;
  categories: AdminServiceCategoryDto[];
}

interface FormErrors {
  categoryId?: string;
  name?: string;
  slug?: string;
}

// AdminServicePlanDto.features/.prices là read DTO (PlanFeatureDto/PlanPriceDto ở lib/types/catalog.ts)
// - không có displayOrder/isActive riêng như input DTO. Reconstruct lại: displayOrder lấy theo index,
// price mặc định isActive=true khi prefill (form Sửa vẫn cho phép tắt lại nếu cần).
function toFeatureInput(feature: AdminServicePlanDto["features"][number], index: number): PlanFeatureInputDto {
  return {
    featureKey: feature.featureKey,
    featureLabel: feature.featureLabel,
    featureValueText: feature.featureValueText,
    featureValueNumeric: feature.featureValueNumeric ?? undefined,
    featureUnit: feature.featureUnit ?? undefined,
    displayOrder: index,
    isHighlighted: feature.isHighlighted,
  };
}

function toPriceInput(price: AdminServicePlanDto["prices"][number]): PlanPriceInputDto {
  return {
    periodMonths: price.periodMonths,
    price: price.price,
    promotionalPrice: price.promotionalPrice ?? undefined,
    currency: price.currency,
    isDefault: price.isDefault,
    isActive: true,
  };
}

function emptyFeature(displayOrder: number): PlanFeatureInputDto {
  return {
    featureKey: "",
    featureLabel: "",
    featureValueText: "",
    featureValueNumeric: undefined,
    featureUnit: "",
    displayOrder,
    isHighlighted: false,
  };
}

function emptyPrice(isDefault: boolean): PlanPriceInputDto {
  return { periodMonths: 1, price: 0, promotionalPrice: undefined, currency: "VND", isDefault, isActive: true };
}

// Không dùng react-hook-form/useFieldArray (chưa từng dùng trong dự án, xem AdminLoginForm.tsx/
// LoginForm.tsx) - Features/Prices quản lý bằng useState<T[]> + thao tác index-based, khớp convention
// hiện có. Update là full-replace (đã verify AdminServicePlanService.UpdateAsync Clear() rồi add lại)
// nên form luôn gửi toàn bộ mảng hiện tại, không gửi delta.
export function ServicePlanForm({ mode, initialData, categories }: ServicePlanFormProps) {
  const router = useRouter();

  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? categories[0]?.id ?? 0);
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initialData);
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [displayOrder, setDisplayOrder] = useState(initialData?.displayOrder ?? 0);
  const [features, setFeatures] = useState<PlanFeatureInputDto[]>(initialData?.features.map(toFeatureInput) ?? []);
  const [prices, setPrices] = useState<PlanPriceInputDto[]>(initialData?.prices.map(toPriceInput) ?? []);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function addFeature() {
    setFeatures((prev) => [...prev, emptyFeature(prev.length)]);
  }

  function updateFeature(index: number, patch: Partial<PlanFeatureInputDto>) {
    setFeatures((prev) => prev.map((feature, i) => (i === index ? { ...feature, ...patch } : feature)));
  }

  function removeFeature(index: number) {
    setFeatures((prev) => prev.filter((_, i) => i !== index).map((feature, i) => ({ ...feature, displayOrder: i })));
  }

  function addPrice() {
    setPrices((prev) => [...prev, emptyPrice(prev.length === 0)]);
  }

  function updatePrice(index: number, patch: Partial<PlanPriceInputDto>) {
    setPrices((prev) =>
      prev.map((price, i) => {
        if (i === index) return { ...price, ...patch };
        // Chỉ 1 dòng được IsDefault - khi check 1 dòng thì tự uncheck các dòng còn lại.
        return patch.isDefault ? { ...price, isDefault: false } : price;
      }),
    );
  }

  function removePrice(index: number) {
    setPrices((prev) => prev.filter((_, i) => i !== index));
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!categoryId) nextErrors.categoryId = "Vui lòng chọn danh mục";
    if (!name.trim()) nextErrors.name = "Vui lòng nhập tên gói";
    else if (name.length > 100) nextErrors.name = "Tên tối đa 100 ký tự";
    if (!slug.trim()) nextErrors.slug = "Vui lòng nhập slug";
    else if (slug.length > 120) nextErrors.slug = "Slug tối đa 120 ký tự";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const dto = {
        categoryId,
        name: name.trim(),
        slug: slug.trim(),
        shortDescription: shortDescription.trim() || undefined,
        description: description.trim() || undefined,
        isFeatured,
        isActive,
        displayOrder,
        features,
        prices,
      };

      const result =
        mode === "edit" && initialData
          ? await updateServicePlanAction(initialData.id, dto)
          : await createServicePlanAction(dto);

      if (!result.success) {
        if (result.message.includes("Slug")) setErrors((prev) => ({ ...prev, slug: result.message }));
        else toast.error(result.message);
        return;
      }

      toast.success(mode === "edit" ? "Đã cập nhật gói dịch vụ" : "Đã thêm gói dịch vụ mới");
      router.push("/admin/service-plans");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="rounded-[24px] border border-zinc-200/60 bg-white p-8 shadow-sm ring-1 ring-zinc-950/5">
        <h2 className="font-heading text-lg font-semibold text-zinc-900">Thông tin cơ bản</h2>
        <FieldGroup className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label htmlFor="plan-category">Danh mục</Label>
              <Select value={String(categoryId)} onValueChange={(value) => setCategoryId(Number(value))}>
                <SelectTrigger id="plan-category" className="w-full">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={errors.categoryId ? [{ message: errors.categoryId }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="plan-display-order">Thứ tự hiển thị</Label>
              <Input
                id="plan-display-order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label htmlFor="plan-name">Tên gói</Label>
              <Input
                id="plan-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                aria-invalid={!!errors.name}
              />
              <FieldError errors={errors.name ? [{ message: errors.name }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="plan-slug">Slug</Label>
              <Input
                id="plan-slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                aria-invalid={!!errors.slug}
              />
              <FieldError errors={errors.slug ? [{ message: errors.slug }] : undefined} />
            </Field>
          </div>

          <Field>
            <Label htmlFor="plan-short-description">Mô tả ngắn</Label>
            <Input
              id="plan-short-description"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Hiển thị dưới tên gói ở trang chủ/bảng giá"
            />
          </Field>

          <Field>
            <Label htmlFor="plan-description">Mô tả chi tiết</Label>
            <Textarea
              id="plan-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </Field>

          <div className="flex flex-wrap gap-8 pt-4">
            <label
              htmlFor="plan-featured"
              className="flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-700"
            >
              <div className="relative flex items-center">
                <input
                  id="plan-featured"
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-zinc-200 transition-colors peer-checked:bg-zinc-900 peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-900/20" />
                <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
              </div>
              Gói nổi bật
            </label>

            <label
              htmlFor="plan-active"
              className="flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-700"
            >
              <div className="relative flex items-center">
                <input
                  id="plan-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-zinc-200 transition-colors peer-checked:bg-emerald-600 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-600/20" />
                <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
              </div>
              Đang hoạt động
            </label>
          </div>
        </FieldGroup>

        {mode === "edit" && initialData && initialData.qrCodeUrl && (
          <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={initialData.qrCodeUrl}
              alt={`Mã QR ${initialData.name}`}
              className="size-20 rounded-lg border border-gray-200"
            />
            <p className="text-sm text-gray-500">
              Mã QR được hệ thống tự sinh lại từ slug mỗi khi lưu, không thể chỉnh sửa thủ công.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-[24px] border border-zinc-200/60 bg-white p-8 shadow-sm ring-1 ring-zinc-950/5">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Tính năng</h2>
          <Button type="button" variant="outline" size="sm" className="border-dashed" onClick={addFeature}>
            <Plus className="size-4" data-icon="inline-start" />
            Thêm tính năng
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {features.length === 0 && <p className="text-sm text-zinc-500">Chưa có tính năng nào.</p>}
          {features.map((feature, index) => (
            <div
              key={index}
              className="group grid grid-cols-1 gap-3 rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-4 transition-colors hover:bg-zinc-50 sm:grid-cols-[1fr_1fr_1fr_7rem_auto_auto] sm:items-center"
            >
              <Input
                placeholder="Khoá (vd: cpu)"
                value={feature.featureKey}
                className="bg-white"
                onChange={(e) => updateFeature(index, { featureKey: e.target.value })}
              />
              <Input
                placeholder="Nhãn (vd: CPU)"
                value={feature.featureLabel}
                className="bg-white"
                onChange={(e) => updateFeature(index, { featureLabel: e.target.value })}
              />
              <Input
                placeholder="Giá trị (vd: 2 vCPU)"
                value={feature.featureValueText}
                className="bg-white"
                onChange={(e) => updateFeature(index, { featureValueText: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Số (tuỳ chọn)"
                value={feature.featureValueNumeric ?? ""}
                className="bg-white"
                onChange={(e) =>
                  updateFeature(index, { featureValueNumeric: e.target.value ? Number(e.target.value) : undefined })
                }
              />
              <label className="flex cursor-pointer items-center gap-2 self-center px-2 text-sm font-medium whitespace-nowrap text-zinc-700">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={feature.isHighlighted}
                    onChange={(e) => updateFeature(index, { isHighlighted: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="h-5 w-9 rounded-full bg-zinc-200 transition-colors peer-checked:bg-amber-500 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-500/20" />
                  <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
                </div>
                Nổi bật
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="self-center text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
                aria-label="Xoá tính năng"
                onClick={() => removeFeature(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[24px] border border-zinc-200/60 bg-white p-8 shadow-sm ring-1 ring-zinc-950/5">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Mức giá</h2>
          <Button type="button" variant="outline" size="sm" className="border-dashed" onClick={addPrice}>
            <Plus className="size-4" data-icon="inline-start" />
            Thêm mức giá
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {prices.length === 0 && <p className="text-sm text-zinc-500">Chưa có mức giá nào.</p>}
          {prices.map((price, index) => (
            <div
              key={index}
              className="group grid grid-cols-1 gap-3 rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-4 transition-colors hover:bg-zinc-50 sm:grid-cols-[6rem_1fr_1fr_auto_auto_auto] sm:items-center"
            >
              <Input
                type="number"
                min={1}
                max={60}
                value={price.periodMonths}
                className="bg-white"
                onChange={(e) => updatePrice(index, { periodMonths: Number(e.target.value) })}
                aria-label="Số tháng"
              />
              <Input
                type="number"
                min={0}
                placeholder="Giá (VNĐ)"
                value={price.price}
                className="bg-white"
                onChange={(e) => updatePrice(index, { price: Number(e.target.value) })}
              />
              <Input
                type="number"
                min={0}
                placeholder="Giá khuyến mãi (tuỳ chọn)"
                value={price.promotionalPrice ?? ""}
                className="bg-white"
                onChange={(e) =>
                  updatePrice(index, { promotionalPrice: e.target.value ? Number(e.target.value) : undefined })
                }
              />
              <label className="flex cursor-pointer items-center gap-2 self-center px-2 text-sm font-medium whitespace-nowrap text-zinc-700">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={price.isDefault}
                    onChange={(e) => updatePrice(index, { isDefault: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="h-5 w-9 rounded-full bg-zinc-200 transition-colors peer-checked:bg-zinc-900 peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-900/20" />
                  <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
                </div>
                Mặc định
              </label>
              <label className="flex cursor-pointer items-center gap-2 self-center px-2 text-sm font-medium whitespace-nowrap text-zinc-700">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={price.isActive}
                    onChange={(e) => updatePrice(index, { isActive: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="h-5 w-9 rounded-full bg-zinc-200 transition-colors peer-checked:bg-emerald-600 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-600/20" />
                  <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
                </div>
                Hoạt động
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="self-center text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
                aria-label="Xoá mức giá"
                onClick={() => removePrice(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" className="rounded-full px-6" onClick={() => router.push("/admin/service-plans")}>
          Huỷ
        </Button>
        <Button type="submit" disabled={isSubmitting} className="rounded-full bg-zinc-900 px-6 text-white hover:bg-zinc-800">
          {isSubmitting ? "Đang lưu..." : "Lưu gói dịch vụ"}
        </Button>
      </div>
    </form>
  );
}
