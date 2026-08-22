"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DiscountType, ScopeType, SCOPE_TYPE_LABELS } from "@/lib/types/enums";
import { createPromotionAction, updatePromotionAction } from "@/app/admin/promotions/actions";
import type {
  AdminPromotionDto,
  AdminServiceCategoryDto,
  AdminServicePlanDto,
  PromotionScopeInputDto,
} from "@/lib/types/admin";

interface PromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion: AdminPromotionDto | null;
  categories: AdminServiceCategoryDto[];
  plans: AdminServicePlanDto[];
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
  description?: string;
  discountValue?: string;
  dateRange?: string;
  scopes?: string;
}

function toDateInputValue(value: string): string {
  return value ? value.slice(0, 10) : "";
}

function emptyScope(): PromotionScopeInputDto {
  return { scopeType: ScopeType.Category, serviceCategoryId: undefined, servicePlanId: undefined };
}

// unpaged-list-in-Dialog pattern (giống ServiceCategoryDialog) - Sửa chỉ prefill từ record đã có sẵn
// trong mảng promotions, không fetch lại. Scopes dùng useState<T[]> + thao tác index-based, y hệt
// Features/Prices ở ServicePlanForm.tsx.
export function PromotionDialog({ open, onOpenChange, promotion, categories, plans }: PromotionDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [scopes, setScopes] = useState<PromotionScopeInputDto[]>([]);
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
        setScopes(
          promotion.scopes.map((scope) => ({
            scopeType: ScopeType[scope.scopeType as keyof typeof ScopeType] ?? ScopeType.Category,
            serviceCategoryId: scope.serviceCategoryId ?? undefined,
            servicePlanId: scope.servicePlanId ?? undefined,
          })),
        );
      } else {
        setForm(EMPTY_FORM);
        setScopes([]);
      }
      setErrors({});
    }
    syncForm();
  }, [open, promotion]);

  const hasAllScope = scopes.some((scope) => scope.scopeType === ScopeType.All);

  function addScope() {
    if (hasAllScope) {
      toast.error("Phạm vi 'Toàn bộ' không thể kết hợp với phạm vi khác - xoá dòng đó trước khi thêm mới.");
      return;
    }
    setScopes((prev) => [...prev, emptyScope()]);
  }

  function updateScope(index: number, patch: Partial<PromotionScopeInputDto>) {
    setScopes((prev) =>
      prev.map((scope, i) => {
        if (i !== index) return scope;
        const next = { ...scope, ...patch };
        if (patch.scopeType !== undefined) {
          if (patch.scopeType !== ScopeType.Category) next.serviceCategoryId = undefined;
          if (patch.scopeType !== ScopeType.Plan) next.servicePlanId = undefined;
        }
        return next;
      }),
    );
  }

  function removeScope(index: number) {
    setScopes((prev) => prev.filter((_, i) => i !== index));
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!form.code.trim()) nextErrors.code = "Vui lòng nhập mã khuyến mãi";
    else if (form.code.length > 50) nextErrors.code = "Mã tối đa 50 ký tự";
    if (!form.name.trim()) nextErrors.name = "Vui lòng nhập tên chương trình";
    else if (form.name.length > 200) nextErrors.name = "Tên tối đa 200 ký tự";
    if (form.description.length > 1000) nextErrors.description = "Mô tả tối đa 1000 ký tự";
    if (form.discountValue <= 0) nextErrors.discountValue = "Giá trị giảm phải lớn hơn 0";
    if (!form.startDate || !form.endDate) {
      nextErrors.dateRange = "Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc";
    } else if (new Date(form.endDate) <= new Date(form.startDate)) {
      // Backend KHÔNG tự kiểm tra EndDate > StartDate - phải chặn ở đây.
      nextErrors.dateRange = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    if (scopes.some((scope) => scope.scopeType === ScopeType.All) && scopes.length > 1) {
      nextErrors.scopes = "Không thể kết hợp phạm vi 'Toàn bộ' với phạm vi khác.";
    } else {
      for (const scope of scopes) {
        if (scope.scopeType === ScopeType.Category && !scope.serviceCategoryId) {
          nextErrors.scopes = "Vui lòng chọn danh mục cho phạm vi 'Theo danh mục'.";
          break;
        }
        if (scope.scopeType === ScopeType.Plan && !scope.servicePlanId) {
          nextErrors.scopes = "Vui lòng chọn gói dịch vụ cho phạm vi 'Theo gói'.";
          break;
        }
      }
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
        scopes,
      };

      const result = promotion
        ? await updatePromotionAction(promotion.id, dto)
        : await createPromotionAction(dto);

      if (!result.success) {
        if (result.message.includes("Code") || result.message.includes("Mã")) {
          setErrors((prev) => ({ ...prev, code: result.message }));
        } else if (result.message.includes("phạm vi") || result.message.includes("danh mục") || result.message.includes("gói")) {
          setErrors((prev) => ({ ...prev, scopes: result.message }));
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
      <DialogContent className="sm:max-w-lg rounded-[24px]">
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
                aria-invalid={!!errors.description}
              />
              <FieldError errors={errors.description ? [{ message: errors.description }] : undefined} />
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
              className="flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-700"
            >
              <div className="relative flex items-center">
                <input
                  id="promotion-active"
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

            <div className="border-t border-zinc-100 pt-4">
              <div className="flex items-center justify-between">
                <Label>Phạm vi áp dụng</Label>
                <Button type="button" variant="outline" size="sm" className="border-dashed" onClick={addScope}>
                  <Plus className="size-4" data-icon="inline-start" />
                  Thêm phạm vi
                </Button>
              </div>

              <div className="mt-3 flex flex-col gap-3">
                {scopes.length === 0 && (
                  <p className="text-sm text-zinc-500">Chưa giới hạn phạm vi - áp dụng cho toàn bộ đơn hàng.</p>
                )}
                {scopes.map((scope, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 gap-2 rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center"
                  >
                    <Select
                      value={String(scope.scopeType)}
                      onValueChange={(value) => updateScope(index, { scopeType: Number(value) as ScopeType })}
                    >
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SCOPE_TYPE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={String(ScopeType[key as keyof typeof ScopeType])}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {scope.scopeType === ScopeType.Category && (
                      <Select
                        value={scope.serviceCategoryId ? String(scope.serviceCategoryId) : ""}
                        onValueChange={(value) => updateScope(index, { serviceCategoryId: Number(value) })}
                      >
                        <SelectTrigger className="w-full bg-white">
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
                    )}

                    {scope.scopeType === ScopeType.Plan && (
                      <Select
                        value={scope.servicePlanId ? String(scope.servicePlanId) : ""}
                        onValueChange={(value) => updateScope(index, { servicePlanId: Number(value) })}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Chọn gói dịch vụ" />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.map((plan) => (
                            <SelectItem key={plan.id} value={String(plan.id)}>
                              {plan.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {scope.scopeType === ScopeType.All && <div />}

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="self-center justify-self-end text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Xoá phạm vi"
                      onClick={() => removeScope(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <FieldError className="mt-2" errors={errors.scopes ? [{ message: errors.scopes }] : undefined} />
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-zinc-900 px-6 text-white hover:bg-zinc-800"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
