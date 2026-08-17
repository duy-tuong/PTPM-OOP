import { cn } from "@/lib/utils";

interface PromotionStatusBadgeProps {
  isActive: boolean;
  startDate: string;
  endDate: string;
}

interface PromotionStatusInfo {
  label: string;
  className: string;
}

// Tách riêng khỏi component - Date.now() không được gọi trực tiếp trong thân component (vi phạm
// react-hooks/purity), phải nằm trong 1 hàm thuần thường (không phải Component/Hook).
function getPromotionStatus(isActive: boolean, startDate: string, endDate: string): PromotionStatusInfo {
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (!isActive) return { label: "Đã tắt", className: "bg-gray-100 text-gray-600" };
  if (now < start) return { label: "Chưa bắt đầu", className: "bg-blue-100 text-blue-800" };
  if (now > end) return { label: "Đã hết hạn", className: "bg-red-100 text-red-800" };
  return { label: "Đang áp dụng", className: "bg-green-100 text-green-800" };
}

// Trạng thái hiệu lực THẬT (không chỉ đọc IsActive) - 1 khuyến mãi IsActive=true nhưng StartDate ở
// tương lai hoặc EndDate đã qua thì KHÔNG đang áp dụng, tránh hiểu nhầm khi xem danh sách.
export function PromotionStatusBadge({ isActive, startDate, endDate }: PromotionStatusBadgeProps) {
  const { label, className } = getPromotionStatus(isActive, startDate, endDate);

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", className)}>
      {label}
    </span>
  );
}
