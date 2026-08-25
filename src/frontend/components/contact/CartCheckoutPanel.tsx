"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { CustomerTypeToggle } from "@/components/contact/CustomerTypeToggle";
import { useCart } from "@/lib/cart/CartContext";
import { CustomerType } from "@/lib/types/enums";
import { cn, formatCurrency } from "@/lib/utils";
import {
  CUSTOMER_SESSION_CHANGED_EVENT,
  readCustomerSessionCookie,
} from "@/lib/auth/customerSessionClient";
import type { CustomerSessionUser } from "@/lib/types/customerAuth";
import type { PromotionDto } from "@/lib/types/catalog";
import type { CreateOrderRequestDto, OrderRequestDto } from "@/lib/types/sales";

interface CheckoutErrors {
  items?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Nơi chốt đơn duy nhất cho cả 2 luồng đặt hàng (gói dịch vụ + tên miền) - OrderRequestForm.tsx/
// DomainOrderForm.tsx giờ chỉ "thêm vào giỏ" (không gọi mạng, xem comment ở 2 file đó). Panel này giữ
// form thông tin khách hàng (chuyển nguyên từ OrderRequestForm.tsx cũ, dùng chung cho toàn giỏ thay vì
// lặp lại ở từng form) + gộp toàn bộ giỏ hàng thành 1 CreateOrderRequestDto (header + items[]) khi đặt.
// promotion vẫn resolve từ ?promotionCode= ở page.tsx như cơ chế cũ (không có ô nhập mã thủ công).
export function CartCheckoutPanel({ promotion }: { promotion: PromotionDto | null }) {
  const cart = useCart();
  const router = useRouter();
  const [session, setSession] = useState<CustomerSessionUser | null>(null);
  const [customerType, setCustomerType] = useState(CustomerType.Individual);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Đặt hàng bắt buộc đăng nhập (khớp [Authorize(Roles="Customer")] phía backend) - đọc cookie
  // "customer_session" y hệt Navbar.tsx để biết trạng thái đăng nhập mà không cần gọi API riêng.
  useEffect(() => {
    function syncSession() {
      setSession(readCustomerSessionCookie());
    }

    syncSession();
    window.addEventListener(CUSTOMER_SESSION_CHANGED_EVENT, syncSession);
    return () => window.removeEventListener(CUSTOMER_SESSION_CHANGED_EVENT, syncSession);
  }, []);

  function validate(): boolean {
    const nextErrors: CheckoutErrors = {};
    if (cart.items.length === 0) {
      nextErrors.items = "Giỏ hàng đang trống, vui lòng thêm ít nhất 1 sản phẩm.";
    }
    if (!customerName.trim() || customerName.trim().length > 150) {
      nextErrors.customerName = "Vui lòng nhập họ tên (tối đa 150 ký tự)";
    }
    if (!customerEmail.trim() || !EMAIL_PATTERN.test(customerEmail) || customerEmail.length > 100) {
      nextErrors.customerEmail = "Email không hợp lệ";
    }
    if (!customerPhone.trim() || customerPhone.trim().length > 20) {
      nextErrors.customerPhone = "Vui lòng nhập số điện thoại (tối đa 20 ký tự)";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const dto: CreateOrderRequestDto = {
        customerType,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        companyName: customerType === CustomerType.Business ? companyName.trim() || undefined : undefined,
        taxCode: customerType === CustomerType.Business ? taxCode.trim() || undefined : undefined,
        promotionId: promotion?.id,
        note: note.trim() || undefined,
        items: cart.items.map((item) => ({
          servicePlanId: item.servicePlanId,
          tldPricingId: item.tldPricingId,
          domainName: item.domainName,
          periodMonths: item.periodMonths,
          quantity: item.quantity,
          addons: item.addons?.map((a) => ({ addonId: a.addonId, quantity: a.quantity })),
          chosenVcpu: item.chosenVcpu,
          chosenRamMb: item.chosenRamMb,
          chosenDiskGb: item.chosenDiskGb,
        })),
      };

      const res = await fetch("/api/order-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Đặt hàng thất bại, vui lòng thử lại.");
      }

      const result = (await res.json()) as OrderRequestDto;
      cart.clear();
      router.push(`/thanh-toan/${result.orderCode}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đặt hàng thất bại, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6">
      <div>
        <h2 className="font-heading text-xl font-semibold">Giỏ hàng của bạn</h2>

        {cart.items.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Chưa có sản phẩm nào trong giỏ.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {cart.items.map((item) => (
              <li
                key={item.key}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{item.label}</p>
                  <p className="text-muted-foreground">{formatCurrency(item.unitPriceDisplay)} / đơn vị</p>
                  {item.chosenVcpu != null && item.chosenRamMb != null && item.chosenDiskGb != null && (
                    <p className="text-xs text-muted-foreground">
                      {item.chosenVcpu} vCPU - {(item.chosenRamMb / 1024).toFixed(item.chosenRamMb % 1024 === 0 ? 0 : 1)} GB RAM - {item.chosenDiskGb} GB Disk
                    </p>
                  )}
                  {item.addons && item.addons.length > 0 && (
                    <ul className="mt-1 flex flex-col gap-0.5">
                      {item.addons.map((addon) => (
                        <li key={addon.addonId} className="text-xs text-muted-foreground">
                          + {addon.label} x{addon.quantity} ({formatCurrency(addon.priceDisplay)})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={item.quantity}
                  onChange={(e) =>
                    cart.updateQuantity(item.key, Math.min(100, Math.max(1, Number(e.target.value) || 1)))
                  }
                  aria-label={`Số lượng ${item.label}`}
                  className="h-9 w-16 shrink-0 text-center"
                />
                <button
                  type="button"
                  onClick={() => cart.removeItem(item.key)}
                  aria-label={`Xoá ${item.label} khỏi giỏ`}
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {errors.items && <p className="mt-2 text-sm text-destructive">{errors.items}</p>}

        {cart.items.length > 0 && (
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Tạm tính</span>
            <span className="font-heading text-lg font-semibold text-foreground">
              {formatCurrency(cart.subtotalDisplay)}
            </span>
          </div>
        )}
      </div>

      {promotion && (
        <div className="rounded-xl border border-primary/40 bg-primary/5 px-4 py-3 text-sm">
          <span className="font-medium text-foreground">Mã khuyến mãi: {promotion.code}</span>
          {promotion.description && <p className="mt-1 text-muted-foreground">{promotion.description}</p>}
        </div>
      )}

      {!session && (
        <div className="rounded-xl border border-primary/40 bg-primary/5 px-4 py-4 text-sm">
          <p className="font-medium text-foreground">Vui lòng đăng nhập để đặt hàng</p>
          <p className="mt-1 text-muted-foreground">
            Đăng nhập giúp bạn xem lại đơn hàng, thông tin bàn giao dịch vụ và tự gia hạn sau này. Giỏ
            hàng của bạn vẫn được giữ nguyên trong lúc đăng nhập.
          </p>
          <Button
            nativeButton={false}
            className="mt-3 h-10 rounded-full px-6"
            render={<Link href="/login">Đăng nhập</Link>}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className={cn("flex flex-col gap-6", !session && "hidden")}>
        <CustomerTypeToggle value={customerType} onChange={setCustomerType} />

        <FieldGroup>
          <Field>
            <Label htmlFor="checkout-name">Họ và tên</Label>
            <Input
              id="checkout-name"
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
            <Label htmlFor="checkout-email">Email</Label>
            <Input
              id="checkout-email"
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
            <Label htmlFor="checkout-phone">Số điện thoại</Label>
            <Input
              id="checkout-phone"
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
                <Label htmlFor="checkout-company">Tên công ty</Label>
                <Input
                  id="checkout-company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-11"
                />
              </Field>
              <Field>
                <Label htmlFor="checkout-taxcode">Mã số thuế</Label>
                <Input
                  id="checkout-taxcode"
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  className="h-11"
                />
              </Field>
            </>
          )}

          <Field>
            <Label htmlFor="checkout-note">Ghi chú (không bắt buộc)</Label>
            <textarea
              id="checkout-note"
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
          {isSubmitting ? "Đang đặt hàng..." : "Đặt hàng"}
        </Button>
      </form>
    </div>
  );
}
