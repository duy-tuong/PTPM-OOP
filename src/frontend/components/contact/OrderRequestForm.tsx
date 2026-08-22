"use client";

import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerTypeToggle } from "@/components/contact/CustomerTypeToggle";
import { priceFor } from "@/components/pricing/PlanConfiguratorSlider";
import { CustomerType } from "@/lib/types/enums";
import { cn, formatCurrency } from "@/lib/utils";
import type { ServicePlanListItemDto } from "@/lib/types/catalog";
import type { PromotionDto } from "@/lib/types/catalog";
import type { OrderRequestDto } from "@/lib/types/sales";

interface OrderFormErrors {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  servicePlanId?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function defaultPeriod(plan: ServicePlanListItemDto | null): number | null {
  if (!plan || plan.prices.length === 0) return null;
  return (plan.prices.find((p) => p.isDefault) ?? plan.prices[0]).periodMonths;
}

// Field theo đúng CreateOrderRequestDto (giới hạn ký tự mirror DataAnnotations: tên 150/email 100/
// phone 20). quantity LUÔN gửi tường minh (mặc định 1) - thiếu field này C# nhận 0, fail [Range(1,100)].
// Nếu có promotion resolve được từ ?promotionCode= (page.tsx): gửi kèm promotionId - backend tự validate
// hiệu lực + tính giảm giá vào totalPrice trả về (OrderRequestService.ApplyPromotion).
// Gửi qua /api/order-requests (Route Handler, không phải lib/api/sales.ts trực tiếp) để đính kèm cookie
// access token của khách (nếu đã đăng nhập) - backend gán CustomerId cho đơn, đơn sẽ hiện ở "Đơn hàng
// của tôi". Khách chưa đăng nhập vẫn đặt được bình thường (route handler gửi token undefined).
export function OrderRequestForm({
  plans,
  defaultPlan,
  promotion,
}: {
  plans: ServicePlanListItemDto[];
  defaultPlan: ServicePlanListItemDto | null;
  promotion: PromotionDto | null;
}) {
  const [customerType, setCustomerType] = useState(CustomerType.Individual);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [servicePlanId, setServicePlanId] = useState<number | null>(defaultPlan?.id ?? null);
  const [periodMonths, setPeriodMonths] = useState<number | null>(defaultPeriod(defaultPlan));
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<OrderFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<OrderRequestDto | null>(null);

  const selectedPlan = useMemo(() => plans.find((p) => p.id === servicePlanId) ?? null, [plans, servicePlanId]);

  function handlePlanChange(value: string | null) {
    const id = value ? Number(value) : null;
    setServicePlanId(id);
    const plan = plans.find((p) => p.id === id) ?? null;
    setPeriodMonths(defaultPeriod(plan));
  }

  function validate(): boolean {
    const nextErrors: OrderFormErrors = {};
    if (!customerName.trim() || customerName.trim().length > 150) {
      nextErrors.customerName = "Vui lòng nhập họ tên (tối đa 150 ký tự)";
    }
    if (!customerEmail.trim() || !EMAIL_PATTERN.test(customerEmail) || customerEmail.length > 100) {
      nextErrors.customerEmail = "Email không hợp lệ";
    }
    if (!customerPhone.trim() || customerPhone.trim().length > 20) {
      nextErrors.customerPhone = "Vui lòng nhập số điện thoại (tối đa 20 ký tự)";
    }
    if (!servicePlanId) {
      nextErrors.servicePlanId = "Vui lòng chọn gói dịch vụ";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmittedOrder(null);
    try {
      const res = await fetch("/api/order-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerType,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          companyName: customerType === CustomerType.Business ? companyName.trim() || undefined : undefined,
          taxCode: customerType === CustomerType.Business ? taxCode.trim() || undefined : undefined,
          servicePlanId: servicePlanId ?? undefined,
          periodMonths: periodMonths ?? undefined,
          promotionId: promotion?.id,
          quantity,
          note: note.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Gửi đơn thất bại, vui lòng thử lại.");
      }

      const result = (await res.json()) as OrderRequestDto;

      toast.success("Đã gửi đơn đặt dịch vụ, đội ngũ Cloudverse sẽ liên hệ sớm");
      setSubmittedOrder(result);
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setCompanyName("");
      setTaxCode("");
      setNote("");
      setQuantity(1);
      setErrors({});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gửi đơn thất bại, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {submittedOrder && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 px-4 py-3 text-sm">
          <span className="font-medium text-foreground">Đã gửi đơn thành công - Mã đơn hàng: {submittedOrder.orderCode}</span>
          <p className="mt-1 text-muted-foreground">
            Tổng giá trị dự kiến: {formatCurrency(submittedOrder.totalPrice)}. Vui lòng lưu lại mã đơn hàng để tiện tra cứu khi cần hỗ trợ.
          </p>
        </div>
      )}

      {promotion && (
        <div className="rounded-xl border border-primary/40 bg-primary/5 px-4 py-3 text-sm">
          <span className="font-medium text-foreground">Mã khuyến mãi: {promotion.code}</span>
          {promotion.description && <p className="mt-1 text-muted-foreground">{promotion.description}</p>}
        </div>
      )}

      <CustomerTypeToggle value={customerType} onChange={setCustomerType} />

      <FieldGroup>
        <Field>
          <Label htmlFor="order-plan">Gói dịch vụ</Label>
          <Select
            items={plans.map((plan) => ({ value: String(plan.id), label: `${plan.categoryName} - ${plan.name}` }))}
            value={servicePlanId ? String(servicePlanId) : undefined}
            onValueChange={handlePlanChange}
          >
            <SelectTrigger id="order-plan" className="w-full">
              <SelectValue placeholder="Chọn gói dịch vụ" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={String(plan.id)}>
                  {plan.categoryName} - {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={errors.servicePlanId ? [{ message: errors.servicePlanId }] : undefined} />
        </Field>

        {selectedPlan && selectedPlan.prices.length > 0 && (
          <Field>
            <Label htmlFor="order-period">Chu kỳ thanh toán</Label>
            <Select
              items={selectedPlan.prices.map((price) => ({
                value: String(price.periodMonths),
                label: `${price.periodMonths} tháng - ${formatCurrency(price.promotionalPrice ?? price.price)}`,
              }))}
              value={periodMonths ? String(periodMonths) : undefined}
              onValueChange={(value) => setPeriodMonths(value ? Number(value) : null)}
            >
              <SelectTrigger id="order-period" className="w-full">
                <SelectValue placeholder="Chọn chu kỳ" />
              </SelectTrigger>
              <SelectContent>
                {selectedPlan.prices.map((price) => (
                  <SelectItem key={price.periodMonths} value={String(price.periodMonths)}>
                    {price.periodMonths} tháng - {formatCurrency(price.promotionalPrice ?? price.price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}

        {selectedPlan && periodMonths && (
          <div className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Bạn đang đặt: </span>
            <span className="font-medium text-foreground">{selectedPlan.name}</span>
            <span className="text-muted-foreground"> - </span>
            <span className="font-medium text-primary">{formatCurrency(priceFor(selectedPlan, periodMonths))}</span>
          </div>
        )}

        <Field>
          <Label htmlFor="order-quantity">Số lượng</Label>
          <Input
            id="order-quantity"
            type="number"
            min={1}
            max={100}
            value={quantity}
            onChange={(e) => setQuantity(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
            className="h-11 w-32"
          />
        </Field>

        <Field>
          <Label htmlFor="order-name">Họ và tên</Label>
          <Input
            id="order-name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            aria-invalid={!!errors.customerName}
            className="h-11"
          />
          <FieldError errors={errors.customerName ? [{ message: errors.customerName }] : undefined} />
        </Field>

        <Field>
          <Label htmlFor="order-email">Email</Label>
          <Input
            id="order-email"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="ban@congty.vn"
            autoComplete="email"
            aria-invalid={!!errors.customerEmail}
            className="h-11"
          />
          <FieldError errors={errors.customerEmail ? [{ message: errors.customerEmail }] : undefined} />
        </Field>

        <Field>
          <Label htmlFor="order-phone">Số điện thoại</Label>
          <Input
            id="order-phone"
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="09xxxxxxxx"
            autoComplete="tel"
            aria-invalid={!!errors.customerPhone}
            className="h-11"
          />
          <FieldError errors={errors.customerPhone ? [{ message: errors.customerPhone }] : undefined} />
        </Field>

        {customerType === CustomerType.Business && (
          <>
            <Field>
              <Label htmlFor="order-company">Tên công ty</Label>
              <Input
                id="order-company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="h-11"
              />
            </Field>
            <Field>
              <Label htmlFor="order-taxcode">Mã số thuế</Label>
              <Input id="order-taxcode" value={taxCode} onChange={(e) => setTaxCode(e.target.value)} className="h-11" />
            </Field>
          </>
        )}

        <Field>
          <Label htmlFor="order-note">Ghi chú (không bắt buộc)</Label>
          <textarea
            id="order-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={1000}
            className={cn(
              "w-full min-w-0 rounded-xl border border-input bg-transparent px-3 py-2 text-[15px] transition-colors outline-none",
              "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
          />
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={isSubmitting} className="h-11 w-full text-base font-semibold">
        {isSubmitting ? "Đang gửi..." : "Đặt dịch vụ"}
      </Button>
    </form>
  );
}
