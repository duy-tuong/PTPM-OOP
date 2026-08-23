"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { priceFor } from "@/components/pricing/PlanConfiguratorSlider";
import { useCart } from "@/lib/cart/CartContext";
import type { ServicePlanListItemDto, TldPricingDto } from "@/lib/types/catalog";

function defaultPeriod(plan: ServicePlanListItemDto): number | null {
  if (plan.prices.length === 0) return null;
  return (plan.prices.find((p) => p.isDefault) ?? plan.prices[0]).periodMonths;
}

// Tự thêm 1 sản phẩm vào giỏ khi khách hạ cánh /lien-he từ 1 nút CTA có sẵn plan/tldPricing (9 điểm
// gọi hiện có trên site - PricingMatrixTabs, PlanConfiguratorSlider, PlanDetailContent,
// PlanFloatingBuyBar, DomainPricingTable, PlanPricingGrid...). Các file đó KHÔNG cần sửa gì - vẫn trỏ
// CTA về ?planId=/?tldPricingId= như cũ, chỉ khác là khách giờ hạ cánh vào giỏ hàng đã có sẵn 1 dòng
// thay vì 1 form đơn lẻ điền tay.
// Không render UI, chỉ effect chạy đúng 1 lần lúc mount (deps rỗng có chủ đích) - nơi gọi (page.tsx)
// cần tự remount component này bằng key={defaultPlan?.id ?? defaultTldPricing?.id ?? "none"} để add
// đúng sản phẩm mới khi query param đổi giữa các lần điều hướng tới cùng route.
export function AutoAddFromQuery({
  defaultPlan,
  defaultTldPricing,
  defaultDomainName,
}: {
  defaultPlan: ServicePlanListItemDto | null;
  defaultTldPricing: TldPricingDto | null;
  defaultDomainName: string;
}) {
  const cart = useCart();

  useEffect(() => {
    if (defaultPlan) {
      const periodMonths = defaultPeriod(defaultPlan);
      if (periodMonths === null) return;
      cart.addItem({
        servicePlanId: defaultPlan.id,
        periodMonths,
        quantity: 1,
        label: `${defaultPlan.categoryName} - ${defaultPlan.name}`,
        unitPriceDisplay: priceFor(defaultPlan, periodMonths),
      });
      toast.success("Đã thêm vào giỏ hàng");
      return;
    }

    if (defaultTldPricing && defaultDomainName.trim()) {
      cart.addItem({
        tldPricingId: defaultTldPricing.id,
        domainName: defaultDomainName.trim(),
        quantity: 1,
        label: `${defaultDomainName.trim()}${defaultTldPricing.tld}`,
        unitPriceDisplay: defaultTldPricing.registerPrice,
      });
      toast.success("Đã thêm vào giỏ hàng");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy 1 lần lúc mount, nơi gọi tự remount qua `key` khi query đổi
  }, []);

  return null;
}
