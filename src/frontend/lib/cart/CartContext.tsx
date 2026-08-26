"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const CART_STORAGE_KEY = "cloudverse-cart";

// Giỏ hàng chỉ lưu thông tin hiển thị (label, đơn giá hiển thị) song song ID sản phẩm - giá hiển thị
// chỉ để UI, giá thật luôn được backend tính lại từ ServicePlanId/TldPricingId lúc đặt hàng (đúng
// nguyên tắc "không tin giá từ client" đã áp dụng xuyên suốt dự án).
export interface CartAddonSelection {
  addonId: number;
  quantity: number;
  label: string;
  // Tổng tiền addon này CHO CẢ DÒNG (đã nhân quantity*periodMonths) - không nhân thêm lần nữa với
  // CartItem.quantity (addon gắn theo dòng, không nhân theo số lượng gói - xem
  // OrderRequestService.BuildOrderItemAddonsAsync ở backend).
  priceDisplay: number;
}

export interface CartItem {
  key: string;
  servicePlanId?: number;
  tldPricingId?: number;
  domainName?: string;
  periodMonths?: number;
  quantity: number;
  label: string;
  unitPriceDisplay: number;
  addons?: CartAddonSelection[];
  // Chỉ có giá trị khi mua từ gói Custom (packageType === "Custom") - cấu hình khách đã chọn trên
  // thanh trượt, gửi kèm lúc đặt hàng để backend tính lại giá thật (xem CustomPlanSliderConfigurator).
  chosenVcpu?: number;
  chosenRamMb?: number;
  chosenDiskGb?: number;
  // Hệ điều hành đã chọn (Đợt 3, Phần 11) - osImageName chỉ để hiển thị tóm tắt trong giỏ, giá thật
  // (phí bản quyền Windows nếu có) luôn do backend tính lại từ osImageId lúc đặt hàng.
  osImageId?: number;
  osImageName?: string;
  // Xác thực & bàn giao (Đợt 3, Phần 12) - sshPublicKeyId chỉ để backend snapshot lại nội dung key
  // lúc đặt hàng, hostname/tags là text tự do hiển thị trực tiếp, không qua tính toán giá.
  sshPublicKeyId?: number;
  hostname?: string;
  tags?: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "key">) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  subtotalDisplay: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Nạp giỏ hàng từ localStorage đúng 1 lần lúc mount. Cờ `hydrated` chặn effect ghi lại (bên dưới)
  // không chạy trước khi nạp xong - tránh ghi đè "[]" lên giỏ hàng đã lưu từ trước.
  useEffect(() => {
    function loadCart() {
      try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (raw) setItems(JSON.parse(raw));
      } catch {
        // localStorage có thể bị chặn (chế độ riêng tư/trình duyệt chặn cookie) - bỏ qua, giỏ hàng rỗng.
      }
      setHydrated(true);
    }

    loadCart();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, hydrated]);

  function addItem(item: Omit<CartItem, "key">) {
    const key = typeof crypto !== "undefined" && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    setItems((prev) => [...prev, { ...item, key }]);
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }

  function updateQuantity(key: string, quantity: number) {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, quantity: Math.max(1, quantity) } : item)),
    );
  }

  function clear() {
    setItems([]);
  }

  const subtotalDisplay = items.reduce(
    (sum, item) =>
      sum + item.unitPriceDisplay * item.quantity + (item.addons?.reduce((s, a) => s + a.priceDisplay, 0) ?? 0),
    0,
  );

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear, subtotalDisplay }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart phải được gọi bên trong CartProvider.");
  }
  return ctx;
}
