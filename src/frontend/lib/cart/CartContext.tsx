"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { CUSTOMER_SESSION_CHANGED_EVENT, readCustomerSessionCookie } from "@/lib/auth/customerSessionClient";

// useLayoutEffect chỉ chạy được ở client (SSR gọi sẽ in warning "does nothing on the server") - CartProvider
// LUÔN được server-render 1 lần đầu (Client Component vẫn qua SSR như bình thường) nên phải tự chọn lại
// useEffect khi typeof window === "undefined". Bắt buộc dùng layout effect (không phải effect thường)
// cho bước đăng nhập/khoá giỏ hàng - useEffect chạy theo thứ tự CON TRƯỚC CHA trong CÙNG 1 lượt effect,
// nhưng useLayoutEffect của CartProvider (cha) vẫn luôn chạy xong TRƯỚC MỌI useEffect thường trong cây
// (kể cả của con), nên phải dùng layout effect ở đây để đảm bảo cartKeyRef/hydrated đã đúng trước khi
// AutoAddFromQuery.tsx (dùng useEffect thường) kịp gọi addItem() - nếu không, effect nạp giỏ hàng của
// CartProvider chạy SAU, đọc lại localStorage (chưa kịp ghi) rồi setItems() đè mất item vừa thêm.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const CART_STORAGE_KEY = "cloudverse-cart";
// Giỏ hàng của khách CHƯA đăng nhập - bucket riêng, KHÔNG dùng chung với bất kỳ tài khoản nào. Cho phép
// khách vãng lai thêm sản phẩm trước khi đăng nhập (khớp đúng lời hứa ở CartCheckoutPanel.tsx: "Giỏ
// hàng của bạn vẫn được giữ nguyên trong lúc đăng nhập") nhưng KHÔNG BAO GIỜ hiện lẫn sang tài khoản nào
// khác - chỉ được "nhận" (merge) vào ĐÚNG 1 tài khoản ở lần đăng nhập kế tiếp rồi bucket này bị xoá sạch.
const GUEST_CART_KEY = `${CART_STORAGE_KEY}:guest`;

// Mỗi tài khoản 1 khoá localStorage riêng theo email (duy nhất, ổn định - xem CustomerSessionUser).
// Trước đây CHỈ 1 khoá dùng chung cho cả trình duyệt (không phân biệt ai đang đăng nhập) - trên máy
// dùng chung, khách B đăng nhập sau sẽ thấy đúng giỏ hàng khách A vừa thêm, không đúng chủ. Đăng xuất
// (email = null) trả về bucket khách vãng lai - "ai đó" đăng nhập lại vẫn còn giỏ hàng, nhưng CHƯA đăng
// nhập thì không thấy giỏ hàng của bất kỳ tài khoản nào đã dùng máy này trước đó.
function cartKeyFor(email: string | null): string {
  return email ? `${CART_STORAGE_KEY}:${email.toLowerCase()}` : GUEST_CART_KEY;
}

function readStoredCart(key: string): CartItem[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeStoredCart(key: string, items: CartItem[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // localStorage có thể bị chặn (chế độ riêng tư/trình duyệt chặn cookie) - bỏ qua.
  }
}

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
  // Khoá localStorage đang "sở hữu" state `items` hiện tại - đổi mỗi khi đăng nhập/đăng xuất (xem
  // syncForSession bên dưới). Dùng ref (không phải state) vì effect ghi giỏ hàng cần đọc giá trị MỚI
  // NHẤT ngay lập tức, không đợi thêm 1 lượt render như state thường.
  const cartKeyRef = useRef<string>(GUEST_CART_KEY);

  // Nạp đúng giỏ hàng của tài khoản đang đăng nhập (hoặc bucket khách vãng lai nếu chưa đăng nhập) lúc
  // mount, và nạp lại mỗi khi trạng thái đăng nhập đổi (CUSTOMER_SESSION_CHANGED_EVENT - bắn ra từ
  // LoginForm/RegisterForm/Navbar sau khi gọi API đăng nhập/đăng xuất, xem customerSessionClient.ts).
  // Cờ `hydrated` chặn effect ghi lại (bên dưới) không chạy trước khi nạp xong lần đầu. BẮT BUỘC dùng
  // useIsomorphicLayoutEffect (không phải useEffect thường) - xem comment ở khai báo hàm này phía trên.
  useIsomorphicLayoutEffect(() => {
    function syncForSession() {
      const session = readCustomerSessionCookie();
      const nextKey = cartKeyFor(session?.email ?? null);
      if (nextKey === cartKeyRef.current) return; // trạng thái đăng nhập không đổi, không làm gì thêm.

      let nextItems = readStoredCart(nextKey);
      if (session?.email) {
        // Vừa xác định được 1 tài khoản đang đăng nhập - "nhận" giỏ hàng khách vãng lai (nếu khách vừa
        // thêm gì đó TRƯỚC khi đăng nhập) vào đúng tài khoản này, rồi xoá bucket khách đi. Ưu tiên giữ
        // giỏ hàng ĐÃ LƯU của tài khoản (vd đăng nhập lại) nếu có, tránh giỏ khách vãng lai cũ đè mất.
        const guestItems = readStoredCart(GUEST_CART_KEY);
        if (guestItems.length > 0) {
          nextItems = nextItems.length > 0 ? nextItems : guestItems;
          writeStoredCart(nextKey, nextItems);
          localStorage.removeItem(GUEST_CART_KEY);
        }
      }

      cartKeyRef.current = nextKey;
      setItems(nextItems);
    }

    // Bọc lần gọi đầu trong 1 hàm riêng (không setState trực tiếp ở thân effect) - mirror đúng cách
    // loadCart() cũ đã làm, tránh react-hooks/set-state-in-effect.
    function init() {
      syncForSession();
      setHydrated(true);
    }

    init();
    window.addEventListener(CUSTOMER_SESSION_CHANGED_EVENT, syncForSession);
    return () => window.removeEventListener(CUSTOMER_SESSION_CHANGED_EVENT, syncForSession);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStoredCart(cartKeyRef.current, items);
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
