"use client";

import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { priceFor } from "@/components/pricing/PlanConfiguratorSlider";
import { useCart } from "@/lib/cart/CartContext";
import { formatCurrency } from "@/lib/utils";
import type { ServicePlanListItemDto } from "@/lib/types/catalog";

function defaultPeriod(plan: ServicePlanListItemDto | null): number | null {
  if (!plan || plan.prices.length === 0) return null;
  return (plan.prices.find((p) => p.isDefault) ?? plan.prices[0]).periodMonths;
}

// Chỉ còn bước "chọn sản phẩm" - bấm "Thêm vào giỏ hàng" gọi thẳng useCart().addItem() (không gọi
// mạng). Thông tin khách hàng + submit đơn thật đã chuyển hết sang CartCheckoutPanel.tsx (1 form khách
// hàng dùng chung cho toàn bộ giỏ, thay vì lặp lại ở từng form chọn sản phẩm như trước).
export function OrderRequestForm({
  plans,
  defaultPlan,
}: {
  plans: ServicePlanListItemDto[];
  defaultPlan: ServicePlanListItemDto | null;
}) {
  const cart = useCart();
  const [servicePlanId, setServicePlanId] = useState<number | null>(defaultPlan?.id ?? null);
  const [periodMonths, setPeriodMonths] = useState<number | null>(defaultPeriod(defaultPlan));
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | undefined>();

  const selectedPlan = useMemo(() => plans.find((p) => p.id === servicePlanId) ?? null, [plans, servicePlanId]);

  function handlePlanChange(value: string | null) {
    const id = value ? Number(value) : null;
    setServicePlanId(id);
    const plan = plans.find((p) => p.id === id) ?? null;
    setPeriodMonths(defaultPeriod(plan));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPlan || !periodMonths) {
      setError("Vui lòng chọn gói dịch vụ");
      return;
    }
    setError(undefined);

    cart.addItem({
      servicePlanId: selectedPlan.id,
      periodMonths,
      quantity,
      label: `${selectedPlan.categoryName} - ${selectedPlan.name}`,
      unitPriceDisplay: priceFor(selectedPlan, periodMonths),
    });
    toast.success("Đã thêm vào giỏ hàng");
    setQuantity(1);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
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
          <FieldError errors={error ? [{ message: error }] : undefined} />
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
            <span className="text-muted-foreground">Bạn đang chọn: </span>
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
      </FieldGroup>

      <Button type="submit" className="h-11 w-full text-base font-semibold">
        Thêm vào giỏ hàng
      </Button>
    </form>
  );
}
