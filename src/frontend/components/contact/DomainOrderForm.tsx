"use client";

import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/lib/cart/CartContext";
import { formatCurrency } from "@/lib/utils";
import type { TldPricingDto } from "@/lib/types/catalog";

interface DomainFormErrors {
  tldPricingId?: string;
  domainName?: string;
}

// Nhãn tên miền (phần trước dấu chấm) - khớp DomainLabelPattern phía backend (OrderRequestService.cs).
const DOMAIN_LABEL_PATTERN = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

// Chỉ còn bước "chọn tên miền" - cùng tách y hệt OrderRequestForm.tsx (xem comment ở đó). Thông tin
// khách hàng + submit đơn thật đã chuyển hết sang CartCheckoutPanel.tsx.
export function DomainOrderForm({
  tldPricing,
  defaultTldPricing,
  defaultDomainName,
}: {
  tldPricing: TldPricingDto[];
  defaultTldPricing: TldPricingDto | null;
  defaultDomainName: string;
}) {
  const cart = useCart();
  const [tldPricingId, setTldPricingId] = useState<number | null>(defaultTldPricing?.id ?? null);
  const [domainName, setDomainName] = useState(defaultDomainName);
  const [years, setYears] = useState(1);
  const [errors, setErrors] = useState<DomainFormErrors>({});

  const selectedTld = useMemo(
    () => tldPricing.find((t) => t.id === tldPricingId) ?? null,
    [tldPricing, tldPricingId],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: DomainFormErrors = {};
    if (!selectedTld) {
      nextErrors.tldPricingId = "Vui lòng chọn phần mở rộng tên miền";
    }
    const trimmedDomain = domainName.trim();
    if (!trimmedDomain || !DOMAIN_LABEL_PATTERN.test(trimmedDomain)) {
      nextErrors.domainName = "Tên miền chỉ gồm chữ, số, gạch ngang, không dấu chấm/khoảng trắng";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !selectedTld) return;

    cart.addItem({
      tldPricingId: selectedTld.id,
      domainName: trimmedDomain,
      quantity: years,
      label: `${trimmedDomain}${selectedTld.tld}`,
      unitPriceDisplay: selectedTld.registerPrice,
    });
    toast.success("Đã thêm vào giỏ hàng");
    setDomainName("");
    setYears(1);
    setErrors({});
  }

  if (tldPricing.length === 0) {
    return <p className="text-center text-muted-foreground">Chưa có bảng giá tên miền nào.</p>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
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
            <Select
              items={tldPricing.map((t) => ({ value: String(t.id), label: t.tld }))}
              value={tldPricingId ? String(tldPricingId) : null}
              onValueChange={(v) => setTldPricingId(v ? Number(v) : null)}
            >
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
            <span className="text-muted-foreground">Bạn đang chọn: </span>
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
      </FieldGroup>

      <Button type="submit" className="h-11 w-full text-base font-semibold">
        Thêm vào giỏ hàng
      </Button>
    </form>
  );
}
