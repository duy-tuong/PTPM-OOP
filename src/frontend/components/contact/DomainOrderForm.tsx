"use client";

import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerTypeToggle } from "@/components/contact/CustomerTypeToggle";
import { CustomerType } from "@/lib/types/enums";
import { cn, formatCurrency } from "@/lib/utils";
import type { TldPricingDto, PromotionDto } from "@/lib/types/catalog";
import type { OrderRequestDto } from "@/lib/types/sales";

interface DomainFormErrors {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  tldPricingId?: string;
  domainName?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Nhãn tên miền (phần trước dấu chấm) - khớp DomainLabelPattern phía backend (OrderRequestService.cs).
const DOMAIN_LABEL_PATTERN = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

// Form đặt mua tên miền - tách riêng khỏi OrderRequestForm.tsx (đặt gói dịch vụ) thay vì gộp chung 1
// form nhiều chế độ, vì 2 luồng có bộ field khác hẳn nhau (TLD+tên miền+số năm vs gói+chu kỳ) và mỗi
// form đã có validate/customer-info field riêng theo đúng tiền lệ OrderRequestForm/ConsultationRequestForm
// (2 form đó cũng không share validate chung). Cùng gửi qua /api/order-requests (Route Handler) để
// đính kèm cookie access token khách đăng nhập, giống hệt OrderRequestForm.
export function DomainOrderForm({
  tldPricing,
  defaultTldPricing,
  defaultDomainName,
  promotion,
}: {
  tldPricing: TldPricingDto[];
  defaultTldPricing: TldPricingDto | null;
  defaultDomainName: string;
  promotion: PromotionDto | null;
}) {
  const [customerType, setCustomerType] = useState(CustomerType.Individual);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [tldPricingId, setTldPricingId] = useState<number | null>(defaultTldPricing?.id ?? null);
  const [domainName, setDomainName] = useState(defaultDomainName);
  const [years, setYears] = useState(1);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<DomainFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<OrderRequestDto | null>(null);

  const selectedTld = useMemo(
    () => tldPricing.find((t) => t.id === tldPricingId) ?? null,
    [tldPricing, tldPricingId],
  );

  function validate(): boolean {
    const nextErrors: DomainFormErrors = {};
    if (!customerName.trim() || customerName.trim().length > 150) {
      nextErrors.customerName = "Vui lòng nhập họ tên (tối đa 150 ký tự)";
    }
    if (!customerEmail.trim() || !EMAIL_PATTERN.test(customerEmail) || customerEmail.length > 100) {
      nextErrors.customerEmail = "Email không hợp lệ";
    }
    if (!customerPhone.trim() || customerPhone.trim().length > 20) {
      nextErrors.customerPhone = "Vui lòng nhập số điện thoại (tối đa 20 ký tự)";
    }
    if (!tldPricingId) {
      nextErrors.tldPricingId = "Vui lòng chọn phần mở rộng tên miền";
    }
    const trimmedDomain = domainName.trim();
    if (!trimmedDomain || !DOMAIN_LABEL_PATTERN.test(trimmedDomain)) {
      nextErrors.domainName = "Tên miền chỉ gồm chữ, số, gạch ngang, không dấu chấm/khoảng trắng";
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
          tldPricingId: tldPricingId ?? undefined,
          domainName: domainName.trim(),
          promotionId: promotion?.id,
          quantity: years,
          note: note.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Gửi đơn thất bại, vui lòng thử lại.");
      }

      const result = (await res.json()) as OrderRequestDto;

      toast.success("Đã gửi đơn đặt tên miền, đội ngũ Cloudverse sẽ liên hệ sớm");
      setSubmittedOrder(result);
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setCompanyName("");
      setTaxCode("");
      setDomainName("");
      setNote("");
      setYears(1);
      setErrors({});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gửi đơn thất bại, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (tldPricing.length === 0) {
    return <p className="text-center text-muted-foreground">Chưa có bảng giá tên miền nào.</p>;
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
          <Label htmlFor="domain-name">Tên miền mong muốn</Label>
          <div className="flex items-center gap-2">
            <Input
              id="domain-name"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              placeholder="tencongty"
              aria-invalid={!!errors.domainName}
              className="h-11"
            />
            <Select value={tldPricingId ? String(tldPricingId) : undefined} onValueChange={(v) => setTldPricingId(v ? Number(v) : null)}>
              <SelectTrigger id="domain-tld" className="h-11 w-40 shrink-0">
                <SelectValue placeholder="Chọn TLD" />
              </SelectTrigger>
              <SelectContent>
                {tldPricing.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.tld}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <FieldError
            errors={[errors.domainName, errors.tldPricingId]
              .filter((message): message is string => !!message)
              .map((message) => ({ message }))}
          />
        </Field>

        {selectedTld && domainName.trim() && (
          <div className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Bạn đang đặt: </span>
            <span className="font-medium text-foreground">
              {domainName.trim()}
              {selectedTld.tld}
            </span>
            <span className="text-muted-foreground"> - </span>
            <span className="font-medium text-primary">{formatCurrency(selectedTld.registerPrice)}/năm</span>
          </div>
        )}

        <Field>
          <Label htmlFor="domain-years">Số năm đăng ký</Label>
          <Input
            id="domain-years"
            type="number"
            min={1}
            max={10}
            value={years}
            onChange={(e) => setYears(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
            className="h-11 w-32"
          />
        </Field>

        <Field>
          <Label htmlFor="domain-order-name">Họ và tên</Label>
          <Input
            id="domain-order-name"
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
          <Label htmlFor="domain-order-email">Email</Label>
          <Input
            id="domain-order-email"
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
          <Label htmlFor="domain-order-phone">Số điện thoại</Label>
          <Input
            id="domain-order-phone"
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
              <Label htmlFor="domain-order-company">Tên công ty</Label>
              <Input
                id="domain-order-company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="h-11"
              />
            </Field>
            <Field>
              <Label htmlFor="domain-order-taxcode">Mã số thuế</Label>
              <Input
                id="domain-order-taxcode"
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
                className="h-11"
              />
            </Field>
          </>
        )}

        <Field>
          <Label htmlFor="domain-order-note">Ghi chú (không bắt buộc)</Label>
          <textarea
            id="domain-order-note"
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
        {isSubmitting ? "Đang gửi..." : "Đặt mua tên miền"}
      </Button>
    </form>
  );
}
