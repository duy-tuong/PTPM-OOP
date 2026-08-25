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
import { slugify, formatCurrency } from "@/lib/utils";
import { createServicePlanAction, updateServicePlanAction } from "@/app/admin/service-plans/actions";
import {
  ServicePlanStatus,
  SERVICE_PLAN_STATUS_LABELS,
  SERVICE_PLAN_STATUS_DESCRIPTIONS,
  ServicePlanPackageType,
  SERVICE_PLAN_PACKAGE_TYPE_LABELS,
} from "@/lib/types/enums";
import type {
  AdminAddonDto,
  AdminServiceCategoryDto,
  AdminServicePlanDto,
  PlanFeatureInputDto,
  PlanPriceInputDto,
} from "@/lib/types/admin";
import type { RegionDto } from "@/lib/types/catalog";

const STATUS_OPTIONS = Object.entries(ServicePlanStatus)
  .filter(([, value]) => typeof value === "number")
  .map(([key, value]) => ({
    value: String(value),
    label: SERVICE_PLAN_STATUS_LABELS[key] ?? key,
    description: SERVICE_PLAN_STATUS_DESCRIPTIONS[key],
  }));

const PACKAGE_TYPE_OPTIONS = Object.entries(ServicePlanPackageType)
  .filter(([, value]) => typeof value === "number")
  .map(([key, value]) => ({
    value: String(value),
    label: SERVICE_PLAN_PACKAGE_TYPE_LABELS[key] ?? key,
  }));

function packageTypeNameToValue(name: string | undefined): ServicePlanPackageType {
  if (!name) return ServicePlanPackageType.Fixed;
  const entry = Object.entries(ServicePlanPackageType).find(([key]) => key === name);
  return entry ? (Number(entry[1]) as ServicePlanPackageType) : ServicePlanPackageType.Fixed;
}

// AdminServicePlanDto.status là chuỗi tên enum (vd "Active") - map ngược sang giá trị số của
// ServicePlanStatus để làm giá trị khởi tạo cho state (dto gửi đi cần enum số, xem lib/types/admin.ts).
function statusNameToValue(name: string | undefined): ServicePlanStatus {
  if (!name) return ServicePlanStatus.Active;
  const entry = Object.entries(ServicePlanStatus).find(([key]) => key === name);
  return entry ? (Number(entry[1]) as ServicePlanStatus) : ServicePlanStatus.Active;
}

interface ServicePlanFormProps {
  mode: "create" | "edit";
  initialData?: AdminServicePlanDto;
  categories: AdminServiceCategoryDto[];
  regions: RegionDto[];
  availableAddons: AdminAddonDto[];
}

interface FormErrors {
  categoryId?: string;
  name?: string;
  slug?: string;
  shortDescription?: string;
  customConfig?: string;
}

// Mirror validate 1 chiều Min/Max/Step ở AdminServicePlanService.ValidateCustomDimension (backend) -
// chỉ để báo lỗi sớm cho Admin, backend vẫn là nguồn validate cuối cùng.
function validateCustomDimension(label: string, min?: number, max?: number, step?: number): string | undefined {
  if (min == null || max == null || step == null) return `Gói tuỳ biến cần nhập đủ Min/Max/Bước nhảy cho ${label}.`;
  if (step <= 0) return `Bước nhảy ${label} phải lớn hơn 0.`;
  if (min > max) return `Giá trị nhỏ nhất ${label} phải nhỏ hơn hoặc bằng giá trị lớn nhất.`;
  if ((max - min) % step !== 0) return `Khoảng ${label} phải chia hết cho bước nhảy.`;
  return undefined;
}

interface FeatureRowErrors {
  featureKey?: string;
  featureLabel?: string;
  featureValueText?: string;
}

interface PriceRowErrors {
  periodMonths?: string;
  price?: string;
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
    discountPercent: price.discountPercent ?? undefined,
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
export function ServicePlanForm({ mode, initialData, categories, regions, availableAddons }: ServicePlanFormProps) {
  const router = useRouter();

  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? categories[0]?.id ?? 0);
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initialData);
  const [sku, setSku] = useState(initialData?.sku ?? "");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [status, setStatus] = useState<ServicePlanStatus>(statusNameToValue(initialData?.status));
  const [allowGrandfatheredRenewal, setAllowGrandfatheredRenewal] = useState(
    initialData?.allowGrandfatheredRenewal ?? true,
  );
  const [allowDowngrade, setAllowDowngrade] = useState(initialData?.allowDowngrade ?? true);
  const [regionId, setRegionId] = useState(initialData?.regionId ?? "");
  const [displayOrder, setDisplayOrder] = useState(initialData?.displayOrder ?? 0);
  const [packageType, setPackageType] = useState<ServicePlanPackageType>(
    packageTypeNameToValue(initialData?.packageType),
  );
  const [minVcpu, setMinVcpu] = useState<number | undefined>(initialData?.minVcpu ?? undefined);
  const [maxVcpu, setMaxVcpu] = useState<number | undefined>(initialData?.maxVcpu ?? undefined);
  const [stepVcpu, setStepVcpu] = useState<number | undefined>(initialData?.stepVcpu ?? undefined);
  const [minRamMb, setMinRamMb] = useState<number | undefined>(initialData?.minRamMb ?? undefined);
  const [maxRamMb, setMaxRamMb] = useState<number | undefined>(initialData?.maxRamMb ?? undefined);
  const [stepRamMb, setStepRamMb] = useState<number | undefined>(initialData?.stepRamMb ?? undefined);
  const [minDiskGb, setMinDiskGb] = useState<number | undefined>(initialData?.minDiskGb ?? undefined);
  const [maxDiskGb, setMaxDiskGb] = useState<number | undefined>(initialData?.maxDiskGb ?? undefined);
  const [stepDiskGb, setStepDiskGb] = useState<number | undefined>(initialData?.stepDiskGb ?? undefined);
  const [pricePerVcpuPerMonth, setPricePerVcpuPerMonth] = useState<number | undefined>(
    initialData?.pricePerVcpuPerMonth ?? undefined,
  );
  const [pricePerRamGbPerMonth, setPricePerRamGbPerMonth] = useState<number | undefined>(
    initialData?.pricePerRamGbPerMonth ?? undefined,
  );
  const [pricePerDiskGbPerMonth, setPricePerDiskGbPerMonth] = useState<number | undefined>(
    initialData?.pricePerDiskGbPerMonth ?? undefined,
  );
  const [features, setFeatures] = useState<PlanFeatureInputDto[]>(initialData?.features.map(toFeatureInput) ?? []);
  const [prices, setPrices] = useState<PlanPriceInputDto[]>(initialData?.prices.map(toPriceInput) ?? []);
  // AddonId -> MaxQuantity - chỉ addon có mặt trong map này mới được coi là "cho phép mua kèm gói này".
  const [selectedAddons, setSelectedAddons] = useState<Record<number, number>>(() =>
    Object.fromEntries((initialData?.addons ?? []).map((a) => [a.addonId, a.maxQuantity])),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [featureErrors, setFeatureErrors] = useState<Record<number, FeatureRowErrors>>({});
  const [priceErrors, setPriceErrors] = useState<Record<number, PriceRowErrors>>({});
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

  function toggleAddon(addonId: number, checked: boolean) {
    setSelectedAddons((prev) => {
      const next = { ...prev };
      if (checked) next[addonId] = next[addonId] ?? 1;
      else delete next[addonId];
      return next;
    });
  }

  function updateAddonMaxQuantity(addonId: number, maxQuantity: number) {
    setSelectedAddons((prev) => ({ ...prev, [addonId]: Math.max(1, maxQuantity || 1) }));
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!categoryId) nextErrors.categoryId = "Vui lòng chọn danh mục";
    if (!name.trim()) nextErrors.name = "Vui lòng nhập tên gói";
    else if (name.length > 100) nextErrors.name = "Tên tối đa 100 ký tự";
    if (!slug.trim()) nextErrors.slug = "Vui lòng nhập slug";
    else if (slug.length > 120) nextErrors.slug = "Slug tối đa 120 ký tự";
    if (shortDescription.length > 500) nextErrors.shortDescription = "Mô tả ngắn tối đa 500 ký tự";

    if (packageType === ServicePlanPackageType.Custom) {
      const customConfigError =
        validateCustomDimension("vCPU", minVcpu, maxVcpu, stepVcpu) ??
        validateCustomDimension("RAM", minRamMb, maxRamMb, stepRamMb) ??
        validateCustomDimension("Disk", minDiskGb, maxDiskGb, stepDiskGb) ??
        (pricePerVcpuPerMonth == null || pricePerRamGbPerMonth == null || pricePerDiskGbPerMonth == null
          ? "Gói tuỳ biến cần nhập đủ đơn giá vCPU/RAM/Disk."
          : undefined);
      if (customConfigError) nextErrors.customConfig = customConfigError;
    }
    setErrors(nextErrors);

    const nextFeatureErrors: Record<number, FeatureRowErrors> = {};
    features.forEach((feature, index) => {
      const rowErrors: FeatureRowErrors = {};
      if (!feature.featureKey.trim()) rowErrors.featureKey = "Bắt buộc";
      else if (feature.featureKey.length > 100) rowErrors.featureKey = "Tối đa 100 ký tự";
      if (!feature.featureLabel.trim()) rowErrors.featureLabel = "Bắt buộc";
      else if (feature.featureLabel.length > 200) rowErrors.featureLabel = "Tối đa 200 ký tự";
      if (!feature.featureValueText.trim()) rowErrors.featureValueText = "Bắt buộc";
      else if (feature.featureValueText.length > 200) rowErrors.featureValueText = "Tối đa 200 ký tự";
      if (Object.keys(rowErrors).length > 0) nextFeatureErrors[index] = rowErrors;
    });
    setFeatureErrors(nextFeatureErrors);

    const nextPriceErrors: Record<number, PriceRowErrors> = {};
    prices.forEach((price, index) => {
      const rowErrors: PriceRowErrors = {};
      if (!Number.isFinite(price.periodMonths) || price.periodMonths < 1 || price.periodMonths > 60) {
        rowErrors.periodMonths = "Từ 1 đến 60 tháng";
      }
      if (packageType === ServicePlanPackageType.Custom) {
        const discount = price.discountPercent ?? 0;
        if (!Number.isFinite(discount) || discount < 0 || discount > 100) rowErrors.price = "Từ 0 đến 100%";
      } else if (!Number.isFinite(price.price) || price.price < 0) {
        rowErrors.price = "Không được âm";
      }
      if (Object.keys(rowErrors).length > 0) nextPriceErrors[index] = rowErrors;
    });
    setPriceErrors(nextPriceErrors);

    return (
      Object.keys(nextErrors).length === 0 &&
      Object.keys(nextFeatureErrors).length === 0 &&
      Object.keys(nextPriceErrors).length === 0
    );
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
        sku: sku.trim() || undefined,
        shortDescription: shortDescription.trim() || undefined,
        description: description.trim() || undefined,
        isFeatured,
        status,
        allowGrandfatheredRenewal,
        allowDowngrade,
        regionId: regionId || undefined,
        packageType,
        minVcpu: packageType === ServicePlanPackageType.Custom ? minVcpu : undefined,
        maxVcpu: packageType === ServicePlanPackageType.Custom ? maxVcpu : undefined,
        stepVcpu: packageType === ServicePlanPackageType.Custom ? stepVcpu : undefined,
        minRamMb: packageType === ServicePlanPackageType.Custom ? minRamMb : undefined,
        maxRamMb: packageType === ServicePlanPackageType.Custom ? maxRamMb : undefined,
        stepRamMb: packageType === ServicePlanPackageType.Custom ? stepRamMb : undefined,
        minDiskGb: packageType === ServicePlanPackageType.Custom ? minDiskGb : undefined,
        maxDiskGb: packageType === ServicePlanPackageType.Custom ? maxDiskGb : undefined,
        stepDiskGb: packageType === ServicePlanPackageType.Custom ? stepDiskGb : undefined,
        pricePerVcpuPerMonth: packageType === ServicePlanPackageType.Custom ? pricePerVcpuPerMonth : undefined,
        pricePerRamGbPerMonth: packageType === ServicePlanPackageType.Custom ? pricePerRamGbPerMonth : undefined,
        pricePerDiskGbPerMonth: packageType === ServicePlanPackageType.Custom ? pricePerDiskGbPerMonth : undefined,
        displayOrder,
        features,
        // Custom: price/promotionalPrice bị bỏ qua ở backend (chỉ discountPercent có ý nghĩa) - gửi
        // price=0 cho rõ ràng. Fixed: discountPercent không có ý nghĩa - không gửi.
        prices:
          packageType === ServicePlanPackageType.Custom
            ? prices.map((p) => ({ ...p, price: 0, promotionalPrice: undefined }))
            : prices.map((p) => ({ ...p, discountPercent: undefined })),
        addons: Object.entries(selectedAddons).map(([addonId, maxQuantity]) => ({
          addonId: Number(addonId),
          maxQuantity,
        })),
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
              <Select
                items={categories.map((category) => ({ value: String(category.id), label: category.name }))}
                value={String(categoryId)}
                onValueChange={(value) => setCategoryId(Number(value))}
              >
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label htmlFor="plan-sku">Mã sản phẩm (SKU)</Label>
              <Input
                id="plan-sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Tuỳ chọn - mã tra cứu nội bộ, vd: VPS-GEN-1C-2G"
              />
            </Field>

            <Field>
              <Label htmlFor="plan-status">Trạng thái</Label>
              <Select
                items={STATUS_OPTIONS}
                value={String(status)}
                onValueChange={(value) => setStatus(Number(value) as ServicePlanStatus)}
              >
                <SelectTrigger id="plan-status" className="w-full">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {STATUS_OPTIONS.find((o) => o.value === String(status))?.description && (
                <p className="text-xs text-zinc-500">
                  {STATUS_OPTIONS.find((o) => o.value === String(status))?.description}
                </p>
              )}
            </Field>
          </div>

          <Field>
            <Label htmlFor="plan-package-type">Loại đóng gói</Label>
            <Select
              items={PACKAGE_TYPE_OPTIONS}
              value={String(packageType)}
              onValueChange={(value) => setPackageType(Number(value) as ServicePlanPackageType)}
            >
              <SelectTrigger id="plan-package-type" className="w-full">
                <SelectValue placeholder="Chọn loại đóng gói" />
              </SelectTrigger>
              <SelectContent>
                {PACKAGE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-zinc-500">
              {packageType === ServicePlanPackageType.Custom
                ? "Khách kéo thanh trượt chọn vCPU/RAM/Disk - cấu hình bên dưới, khối Mức giá chỉ dùng để khai báo % giảm giá theo chu kỳ."
                : "Khách chọn 1 trong các mức giá cố định ở khối Mức giá bên dưới."}
            </p>
          </Field>

          {packageType === ServicePlanPackageType.Custom && (
            <div className="rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-4">
              <h3 className="text-sm font-semibold text-zinc-900">Cấu hình gói tuỳ biến</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-zinc-500">vCPU (Min / Max / Bước nhảy)</Label>
                  <div className="flex gap-2">
                    <Input type="number" min={1} placeholder="Min" className="bg-white" value={minVcpu ?? ""} onChange={(e) => setMinVcpu(e.target.value ? Number(e.target.value) : undefined)} />
                    <Input type="number" min={1} placeholder="Max" className="bg-white" value={maxVcpu ?? ""} onChange={(e) => setMaxVcpu(e.target.value ? Number(e.target.value) : undefined)} />
                    <Input type="number" min={1} placeholder="Bước" className="bg-white" value={stepVcpu ?? ""} onChange={(e) => setStepVcpu(e.target.value ? Number(e.target.value) : undefined)} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-zinc-500">RAM MB (Min / Max / Bước nhảy)</Label>
                  <div className="flex gap-2">
                    <Input type="number" min={1} placeholder="Min" className="bg-white" value={minRamMb ?? ""} onChange={(e) => setMinRamMb(e.target.value ? Number(e.target.value) : undefined)} />
                    <Input type="number" min={1} placeholder="Max" className="bg-white" value={maxRamMb ?? ""} onChange={(e) => setMaxRamMb(e.target.value ? Number(e.target.value) : undefined)} />
                    <Input type="number" min={1} placeholder="Bước" className="bg-white" value={stepRamMb ?? ""} onChange={(e) => setStepRamMb(e.target.value ? Number(e.target.value) : undefined)} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-zinc-500">Disk GB (Min / Max / Bước nhảy)</Label>
                  <div className="flex gap-2">
                    <Input type="number" min={1} placeholder="Min" className="bg-white" value={minDiskGb ?? ""} onChange={(e) => setMinDiskGb(e.target.value ? Number(e.target.value) : undefined)} />
                    <Input type="number" min={1} placeholder="Max" className="bg-white" value={maxDiskGb ?? ""} onChange={(e) => setMaxDiskGb(e.target.value ? Number(e.target.value) : undefined)} />
                    <Input type="number" min={1} placeholder="Bước" className="bg-white" value={stepDiskGb ?? ""} onChange={(e) => setStepDiskGb(e.target.value ? Number(e.target.value) : undefined)} />
                  </div>
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-zinc-500">Đơn giá / vCPU / tháng (VNĐ)</Label>
                  <Input type="number" min={0} className="bg-white" value={pricePerVcpuPerMonth ?? ""} onChange={(e) => setPricePerVcpuPerMonth(e.target.value ? Number(e.target.value) : undefined)} />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-zinc-500">Đơn giá / GB RAM / tháng (VNĐ)</Label>
                  <Input type="number" min={0} className="bg-white" value={pricePerRamGbPerMonth ?? ""} onChange={(e) => setPricePerRamGbPerMonth(e.target.value ? Number(e.target.value) : undefined)} />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-zinc-500">Đơn giá / GB Disk / tháng (VNĐ)</Label>
                  <Input type="number" min={0} className="bg-white" value={pricePerDiskGbPerMonth ?? ""} onChange={(e) => setPricePerDiskGbPerMonth(e.target.value ? Number(e.target.value) : undefined)} />
                </div>
              </div>
              <FieldError errors={errors.customConfig ? [{ message: errors.customConfig }] : undefined} />
            </div>
          )}

          <Field>
            <Label htmlFor="plan-region">Datacenter / Region</Label>
            <Select
              items={[
                { value: "none", label: "Không hiển thị Region" },
                ...regions.map((region) => ({ value: region.id, label: `${region.name} (${region.city})` })),
              ]}
              value={regionId || "none"}
              onValueChange={(value) => setRegionId(!value || value === "none" ? "" : value)}
            >
              <SelectTrigger id="plan-region" className="w-full">
                <SelectValue placeholder="Không hiển thị Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không hiển thị Region</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name} ({region.city})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-zinc-500">Chỉ hiển thị badge trên storefront, không ảnh hưởng giá.</p>
          </Field>

          <Field>
            <Label htmlFor="plan-short-description">Mô tả ngắn</Label>
            <Input
              id="plan-short-description"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Hiển thị dưới tên gói ở trang chủ/bảng giá"
              aria-invalid={!!errors.shortDescription}
            />
            <FieldError errors={errors.shortDescription ? [{ message: errors.shortDescription }] : undefined} />
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
              htmlFor="plan-grandfather"
              className="flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-700"
            >
              <div className="relative flex items-center">
                <input
                  id="plan-grandfather"
                  type="checkbox"
                  checked={allowGrandfatheredRenewal}
                  onChange={(e) => setAllowGrandfatheredRenewal(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-zinc-200 transition-colors peer-checked:bg-zinc-900 peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-900/20" />
                <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
              </div>
              Giữ giá cũ khi khách gia hạn cùng chu kỳ
            </label>

            <label
              htmlFor="plan-allow-downgrade"
              className="flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-700"
            >
              <div className="relative flex items-center">
                <input
                  id="plan-allow-downgrade"
                  type="checkbox"
                  checked={allowDowngrade}
                  onChange={(e) => setAllowDowngrade(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-zinc-200 transition-colors peer-checked:bg-zinc-900 peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-900/20" />
                <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
              </div>
              Cho phép khách hạ cấp xuống gói này
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
              className="group grid grid-cols-1 gap-3 rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-4 transition-colors hover:bg-zinc-50 sm:grid-cols-[1fr_1fr_1fr_7rem_auto_auto] sm:items-start"
            >
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="Khoá (vd: cpu)"
                  value={feature.featureKey}
                  className="bg-white"
                  onChange={(e) => updateFeature(index, { featureKey: e.target.value })}
                  aria-invalid={!!featureErrors[index]?.featureKey}
                />
                <FieldError
                  errors={featureErrors[index]?.featureKey ? [{ message: featureErrors[index]!.featureKey! }] : undefined}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="Nhãn (vd: CPU)"
                  value={feature.featureLabel}
                  className="bg-white"
                  onChange={(e) => updateFeature(index, { featureLabel: e.target.value })}
                  aria-invalid={!!featureErrors[index]?.featureLabel}
                />
                <FieldError
                  errors={
                    featureErrors[index]?.featureLabel ? [{ message: featureErrors[index]!.featureLabel! }] : undefined
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="Giá trị (vd: 2 vCPU)"
                  value={feature.featureValueText}
                  className="bg-white"
                  onChange={(e) => updateFeature(index, { featureValueText: e.target.value })}
                  aria-invalid={!!featureErrors[index]?.featureValueText}
                />
                <FieldError
                  errors={
                    featureErrors[index]?.featureValueText
                      ? [{ message: featureErrors[index]!.featureValueText! }]
                      : undefined
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <Input
                  type="number"
                  placeholder="Số (tuỳ chọn)"
                  value={feature.featureValueNumeric ?? ""}
                  className="bg-white"
                  onChange={(e) =>
                    updateFeature(index, { featureValueNumeric: e.target.value ? Number(e.target.value) : undefined })
                  }
                />
              </div>
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
              className="group grid grid-cols-1 gap-3 rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-4 transition-colors hover:bg-zinc-50 sm:grid-cols-[6rem_1fr_1fr_auto_auto_auto] sm:items-start"
            >
              <div className="flex flex-col gap-1">
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={price.periodMonths}
                  className="bg-white"
                  onChange={(e) => updatePrice(index, { periodMonths: Number(e.target.value) })}
                  aria-label="Số tháng"
                  aria-invalid={!!priceErrors[index]?.periodMonths}
                />
                <FieldError
                  errors={
                    priceErrors[index]?.periodMonths ? [{ message: priceErrors[index]!.periodMonths! }] : undefined
                  }
                />
              </div>
              {packageType === ServicePlanPackageType.Custom ? (
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="% giảm giá theo chu kỳ này (vd 10)"
                    value={price.discountPercent ?? ""}
                    className="bg-white"
                    onChange={(e) =>
                      updatePrice(index, { discountPercent: e.target.value ? Number(e.target.value) : undefined })
                    }
                    aria-invalid={!!priceErrors[index]?.price}
                  />
                  <FieldError errors={priceErrors[index]?.price ? [{ message: priceErrors[index]!.price! }] : undefined} />
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <Input
                      type="number"
                      min={0}
                      placeholder="Giá (VNĐ)"
                      value={price.price}
                      className="bg-white"
                      onChange={(e) => updatePrice(index, { price: Number(e.target.value) })}
                      aria-invalid={!!priceErrors[index]?.price}
                    />
                    <FieldError errors={priceErrors[index]?.price ? [{ message: priceErrors[index]!.price! }] : undefined} />
                  </div>
                  <div className="flex flex-col gap-1">
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
                  </div>
                </>
              )}
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

      <div className="rounded-[24px] border border-zinc-200/60 bg-white p-8 shadow-sm ring-1 ring-zinc-950/5">
        <h2 className="font-heading text-lg font-semibold text-zinc-900">Addon cho phép mua kèm</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Chọn tiện ích khách được phép mua thêm khi đặt gói này (IP phụ, ổ đĩa, license...). Quản lý danh
          sách addon ở trang{" "}
          <a href="/admin/addons" className="text-zinc-900 underline underline-offset-2">
            Tiện ích mua kèm
          </a>
          .
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {availableAddons.length === 0 && <p className="text-sm text-zinc-500">Chưa có addon nào trong hệ thống.</p>}
          {availableAddons.map((addon) => {
            const checked = addon.id in selectedAddons;
            return (
              <div
                key={addon.id}
                className="grid grid-cols-1 items-center gap-3 rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-4 sm:grid-cols-[auto_1fr_10rem]"
              >
                <label className="flex cursor-pointer items-center gap-2">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => toggleAddon(addon.id, e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="h-5 w-9 rounded-full bg-zinc-200 transition-colors peer-checked:bg-zinc-900 peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-900/20" />
                    <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
                  </div>
                </label>
                <div className="flex flex-col">
                  <span className="font-medium text-zinc-900">{addon.name}</span>
                  <span className="text-xs text-zinc-500">
                    {formatCurrency(addon.pricePerMonth)}/tháng{addon.unitName ? ` / ${addon.unitName}` : ""}
                  </span>
                </div>
                {checked && (
                  <Input
                    type="number"
                    min={1}
                    max={999}
                    value={selectedAddons[addon.id]}
                    onChange={(e) => updateAddonMaxQuantity(addon.id, Number(e.target.value))}
                    aria-label={`Số lượng tối đa ${addon.name}`}
                    placeholder="Số lượng tối đa"
                    className="bg-white"
                  />
                )}
              </div>
            );
          })}
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
