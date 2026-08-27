"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { priceFor } from "@/components/pricing/PlanConfiguratorSlider";
import { CustomPlanSliderConfigurator, type CustomPlanSelection } from "@/components/pricing/CustomPlanSliderConfigurator";
import { computeCustomPlanUnitPrice } from "@/lib/pricing/customPlanPricing";
import { useCart } from "@/lib/cart/CartContext";
import { formatCurrency } from "@/lib/utils";
import {
  CUSTOMER_SESSION_CHANGED_EVENT,
  readCustomerSessionCookie,
} from "@/lib/auth/customerSessionClient";
import type { CustomerSessionUser } from "@/lib/types/customerAuth";
import type { ServicePlanListItemDto } from "@/lib/types/catalog";
import type { CustomerSshKeyDto } from "@/lib/types/sales";

const NO_SSH_KEY_VALUE = "none";

function defaultCustomSelection(plan: ServicePlanListItemDto | null): CustomPlanSelection | null {
  if (!plan || plan.packageType !== "Custom" || plan.minVcpu == null || plan.minRamMb == null || plan.minDiskGb == null) {
    return null;
  }
  return { vcpu: plan.minVcpu, ramMb: plan.minRamMb, diskGb: plan.minDiskGb };
}

// Giá addon HIỂN THỊ (client) chỉ để preview trước khi thêm giỏ - giá thật luôn được backend tính lại
// từ AddonId lúc đặt hàng (đúng nguyên tắc "không tin giá từ client", xem CartContext.tsx). PerUnit
// và FlatFee dùng CHUNG 1 công thức (đơn giá * kỳ hạn * số lượng) - xem
// OrderRequestService.BuildOrderItemAddonsAsync ở backend, đã verify 2 cách tính billing quy về cùng
// công thức khi UnitPrice hiểu là "giá 1 đơn vị/kỳ hạn".
function addonLineTotal(addon: ServicePlanListItemDto["addons"][number], periodMonths: number, quantity: number) {
  return addon.pricePerMonth * periodMonths * quantity;
}

function defaultPeriod(plan: ServicePlanListItemDto | null): number | null {
  if (!plan || plan.prices.length === 0) return null;
  return (plan.prices.find((p) => p.isDefault) ?? plan.prices[0]).periodMonths;
}

// Hệ điều hành (Đợt 3, Phần 11) - mặc định chọn dòng IsDefault=true nếu Admin đã đặt, không thì null
// (khách phải tự chọn, hoặc plan không cấu hình OS nào thì luôn null).
function defaultOsImageId(plan: ServicePlanListItemDto | null): number | null {
  if (!plan || plan.osImages.length === 0) return null;
  return (plan.osImages.find((o) => o.isDefault) ?? plan.osImages[0]).osImageId;
}

// Phí bản quyền Windows HIỂN THỊ (client) chỉ để preview - giá thật luôn được backend tính lại từ
// osImageId lúc đặt hàng, mirror addonLineTotal.
function osLicenseFeeDisplay(osImage: ServicePlanListItemDto["osImages"][number] | undefined, periodMonths: number) {
  return (osImage?.windowsLicenseFeePerMonth ?? 0) * periodMonths;
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
  // Bắt buộc đăng nhập trước khi thêm vào giỏ (đọc cookie "customer_session" y hệt CartCheckoutPanel.tsx
  // - không có Context/Provider dùng chung, mỗi Client Component cần tự đọc lại).
  const [session, setSession] = useState<CustomerSessionUser | null>(null);
  const [servicePlanId, setServicePlanId] = useState<number | null>(defaultPlan?.id ?? null);
  const [periodMonths, setPeriodMonths] = useState<number | null>(defaultPeriod(defaultPlan));
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | undefined>();
  // AddonId -> số lượng đã chọn - chỉ addon có mặt trong map này mới được thêm vào giỏ.
  const [selectedAddonQty, setSelectedAddonQty] = useState<Record<number, number>>({});
  // Chỉ có giá trị khi selectedPlan.packageType === "Custom" - cấu hình khách kéo thanh trượt.
  const [customSelection, setCustomSelection] = useState<CustomPlanSelection | null>(
    defaultCustomSelection(defaultPlan),
  );
  // Hệ điều hành đã chọn (Đợt 3, Phần 11) - null nếu plan không cấu hình OS nào.
  const [osImageId, setOsImageId] = useState<number | null>(defaultOsImageId(defaultPlan));
  // Xác thực & bàn giao (Đợt 3, Phần 12) - đều tuỳ chọn.
  const [sshPublicKeyId, setSshPublicKeyId] = useState<number | null>(null);
  const [hostname, setHostname] = useState("");
  const [tags, setTags] = useState("");
  const [savedSshKeys, setSavedSshKeys] = useState<CustomerSshKeyDto[]>([]);

  useEffect(() => {
    function syncSession() {
      setSession(readCustomerSessionCookie());
    }

    syncSession();
    window.addEventListener(CUSTOMER_SESSION_CHANGED_EVENT, syncSession);
    return () => window.removeEventListener(CUSTOMER_SESSION_CHANGED_EVENT, syncSession);
  }, []);

  // Nạp SSH Key đã lưu (nếu đã đăng nhập) - im lặng bỏ qua khi chưa đăng nhập (401), khách vẫn duyệt
  // sản phẩm bình thường trước khi đăng nhập ở bước CartCheckoutPanel.tsx.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/customer/ssh-keys")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: CustomerSshKeyDto[]) => {
        if (!cancelled) setSavedSshKeys(data);
      })
      .catch(() => {
        // Chưa đăng nhập hoặc lỗi mạng - không chặn luồng chọn sản phẩm.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPlan = useMemo(() => plans.find((p) => p.id === servicePlanId) ?? null, [plans, servicePlanId]);
  const isCustomPlan = selectedPlan?.packageType === "Custom";
  const selectedOsImage = selectedPlan?.osImages.find((o) => o.osImageId === osImageId);

  function handlePlanChange(value: string | null) {
    const id = value ? Number(value) : null;
    setServicePlanId(id);
    const plan = plans.find((p) => p.id === id) ?? null;
    setPeriodMonths(defaultPeriod(plan));
    setSelectedAddonQty({});
    setCustomSelection(defaultCustomSelection(plan));
    setOsImageId(defaultOsImageId(plan));
    setSshPublicKeyId(null);
    setHostname("");
    setTags("");
  }

  function toggleAddon(addonId: number, checked: boolean) {
    setSelectedAddonQty((prev) => {
      const next = { ...prev };
      if (checked) next[addonId] = 1;
      else delete next[addonId];
      return next;
    });
  }

  function updateAddonQuantity(addonId: number, maxQuantity: number, quantity: number) {
    setSelectedAddonQty((prev) => ({ ...prev, [addonId]: Math.min(maxQuantity, Math.max(1, quantity || 1)) }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }
    if (!selectedPlan || !periodMonths) {
      setError("Vui lòng chọn gói dịch vụ");
      return;
    }
    if (isCustomPlan && !customSelection) {
      setError("Gói này chưa được cấu hình đầy đủ thông số tuỳ biến");
      return;
    }
    setError(undefined);

    const addons = Object.entries(selectedAddonQty).map(([addonId, addonQuantity]) => {
      const addon = selectedPlan.addons.find((a) => a.addonId === Number(addonId))!;
      return {
        addonId: addon.addonId,
        quantity: addonQuantity,
        label: addon.addonName,
        priceDisplay: addonLineTotal(addon, periodMonths, addonQuantity),
      };
    });

    const baseUnitPrice =
      isCustomPlan && customSelection
        ? computeCustomPlanUnitPrice(
            selectedPlan,
            customSelection.vcpu,
            customSelection.ramMb,
            customSelection.diskGb,
            periodMonths,
            selectedPlan.prices.find((p) => p.periodMonths === periodMonths)?.discountPercent,
          )
        : priceFor(selectedPlan, periodMonths);
    const unitPriceDisplay = baseUnitPrice + osLicenseFeeDisplay(selectedOsImage, periodMonths);

    cart.addItem({
      servicePlanId: selectedPlan.id,
      periodMonths,
      quantity,
      label: `${selectedPlan.categoryName} - ${selectedPlan.name}`,
      unitPriceDisplay,
      addons: addons.length > 0 ? addons : undefined,
      chosenVcpu: isCustomPlan && customSelection ? customSelection.vcpu : undefined,
      chosenRamMb: isCustomPlan && customSelection ? customSelection.ramMb : undefined,
      chosenDiskGb: isCustomPlan && customSelection ? customSelection.diskGb : undefined,
      osImageId: selectedOsImage?.osImageId,
      osImageName: selectedOsImage?.osImageName,
      sshPublicKeyId: sshPublicKeyId ?? undefined,
      hostname: hostname.trim() || undefined,
      tags: tags.trim() || undefined,
    });
    toast.success("Đã thêm vào giỏ hàng");
    setQuantity(1);
    setSelectedAddonQty({});
    setSshPublicKeyId(null);
    setHostname("");
    setTags("");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <Label htmlFor="order-plan">Gói dịch vụ</Label>
          <Select
            items={plans.map((plan) => ({ value: String(plan.id), label: `${plan.categoryName} - ${plan.name}` }))}
            value={servicePlanId ? String(servicePlanId) : null}
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
                label: isCustomPlan
                  ? `${price.periodMonths} tháng${price.discountPercent ? ` - giảm ${price.discountPercent}%` : ""}`
                  : `${price.periodMonths} tháng - ${formatCurrency(price.promotionalPrice ?? price.price)}`,
              }))}
              value={periodMonths ? String(periodMonths) : null}
              onValueChange={(value) => setPeriodMonths(value ? Number(value) : null)}
            >
              <SelectTrigger id="order-period" className="w-full">
                <SelectValue placeholder="Chọn chu kỳ" />
              </SelectTrigger>
              <SelectContent>
                {selectedPlan.prices.map((price) => (
                  <SelectItem key={price.periodMonths} value={String(price.periodMonths)}>
                    {isCustomPlan
                      ? `${price.periodMonths} tháng${price.discountPercent ? ` - giảm ${price.discountPercent}%` : ""}`
                      : `${price.periodMonths} tháng - ${formatCurrency(price.promotionalPrice ?? price.price)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}

        {selectedPlan && periodMonths && isCustomPlan && customSelection && (
          <Field>
            <Label>Cấu hình gói ({selectedPlan.name})</Label>
            <CustomPlanSliderConfigurator
              plan={selectedPlan}
              selection={customSelection}
              onChange={setCustomSelection}
              periodMonths={periodMonths}
              discountPercent={selectedPlan.prices.find((p) => p.periodMonths === periodMonths)?.discountPercent}
            />
          </Field>
        )}

        {selectedPlan && periodMonths && !isCustomPlan && (
          <div className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Bạn đang chọn: </span>
            <span className="font-medium text-foreground">{selectedPlan.name}</span>
            <span className="text-muted-foreground"> - </span>
            <span className="font-medium text-primary">{formatCurrency(priceFor(selectedPlan, periodMonths))}</span>
          </div>
        )}

        {selectedPlan && periodMonths && selectedPlan.osImages.length > 0 && (
          <Field>
            <Label>Hệ điều hành</Label>
            <div className="flex flex-col gap-2">
              {selectedPlan.osImages.map((osImage) => (
                <label
                  key={osImage.osImageId}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm"
                >
                  <input
                    type="radio"
                    name="order-os-image"
                    checked={osImageId === osImage.osImageId}
                    onChange={() => setOsImageId(osImage.osImageId)}
                    className="size-4 accent-primary"
                  />
                  <span className="flex-1 font-medium text-foreground">{osImage.osImageName}</span>
                  <span className="text-muted-foreground">
                    {osImage.windowsLicenseFeePerMonth
                      ? `+${formatCurrency(osLicenseFeeDisplay(osImage, periodMonths))}`
                      : "Miễn phí"}
                  </span>
                </label>
              ))}
            </div>
          </Field>
        )}

        {selectedPlan && periodMonths && selectedPlan.addons.length > 0 && (
          <Field>
            <Label>Tiện ích mua kèm (tuỳ chọn)</Label>
            <div className="flex flex-col gap-2">
              {selectedPlan.addons.map((addon) => {
                const checked = addon.addonId in selectedAddonQty;
                const addonQuantity = selectedAddonQty[addon.addonId] ?? 1;
                return (
                  <div
                    key={addon.addonId}
                    className="grid grid-cols-1 items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm sm:grid-cols-[auto_1fr_auto_auto]"
                  >
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => toggleAddon(addon.addonId, e.target.checked)}
                        className="size-4 rounded border-border accent-primary"
                      />
                    </label>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{addon.addonName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(addon.pricePerMonth)}/tháng{addon.unitName ? ` / ${addon.unitName}` : ""} - tối
                        đa {addon.maxQuantity}
                      </span>
                    </div>
                    {checked && addon.maxQuantity > 1 && (
                      <Input
                        type="number"
                        min={1}
                        max={addon.maxQuantity}
                        value={addonQuantity}
                        onChange={(e) => updateAddonQuantity(addon.addonId, addon.maxQuantity, Number(e.target.value))}
                        aria-label={`Số lượng ${addon.addonName}`}
                        className="h-9 w-20"
                      />
                    )}
                    {checked && (
                      <span className="font-medium text-primary">
                        {formatCurrency(addonLineTotal(addon, periodMonths, addonQuantity))}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Field>
        )}

        {selectedPlan && (
          <Field>
            <Label htmlFor="order-ssh-key">Xác thực đăng nhập (tuỳ chọn)</Label>
            <div className="flex items-center gap-3">
              <Select
                items={[
                  { value: NO_SSH_KEY_VALUE, label: "Mật khẩu tự sinh (mặc định)" },
                  ...savedSshKeys.map((k) => ({ value: String(k.id), label: k.label })),
                ]}
                value={sshPublicKeyId ? String(sshPublicKeyId) : NO_SSH_KEY_VALUE}
                onValueChange={(value) => setSshPublicKeyId(!value || value === NO_SSH_KEY_VALUE ? null : Number(value))}
              >
                <SelectTrigger id="order-ssh-key" className="w-full">
                  <SelectValue placeholder="Mật khẩu tự sinh (mặc định)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SSH_KEY_VALUE}>Mật khẩu tự sinh (mặc định)</SelectItem>
                  {savedSshKeys.map((k) => (
                    <SelectItem key={k.id} value={String(k.id)}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <a
                href="/khach-hang/ssh-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-xs whitespace-nowrap text-primary underline underline-offset-2"
              >
                + Thêm SSH Key
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              Có SSH Key thì server tắt đăng nhập bằng mật khẩu (đúng thực tế các nhà cung cấp cloud thật).
            </p>
          </Field>
        )}

        {selectedPlan && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <Label htmlFor="order-hostname">Hostname (tuỳ chọn)</Label>
              <Input
                id="order-hostname"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                placeholder="web-prod-01.domain.com"
                className="h-11"
              />
            </Field>
            <Field>
              <Label htmlFor="order-tags">Tags (tuỳ chọn)</Label>
              <Input
                id="order-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="production, web-tier"
                className="h-11"
              />
            </Field>
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

      {!session && (
        <div className="rounded-xl border border-primary/40 bg-primary/5 px-4 py-4 text-sm">
          <p className="font-medium text-foreground">Vui lòng đăng nhập để thêm vào giỏ hàng</p>
          <p className="mt-1 text-muted-foreground">
            Đăng nhập giúp bạn lưu lại giỏ hàng, xem lại đơn hàng và quản lý dịch vụ dễ dàng hơn sau này.
          </p>
          <Button
            nativeButton={false}
            className="mt-3 h-10 rounded-full px-6"
            render={<Link href="/login">Đăng nhập</Link>}
          />
        </div>
      )}

      <Button type="submit" className="h-11 w-full text-base font-semibold">
        Thêm vào giỏ hàng
      </Button>
    </form>
  );
}
