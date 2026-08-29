"use client";

import { useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";
import { toast } from "sonner";

function CopyValueButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Đã sao chép");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      className="text-muted-foreground transition-colors hover:text-primary"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

export interface ProvisioningDetailsCardProps {
  provisionedIpAddress?: string | null;
  provisionedRootPassword?: string | null;
  provisionedNameservers?: string | null;
}

// "Thông tin bàn giao" mô phỏng (IP + mật khẩu root, hoặc "Đăng nhập bằng SSH Key" khi có IP nhưng
// không có mật khẩu, hoặc Nameserver cho tên miền) - dùng chung cho MyOrderRow/MyServiceRow (khách hàng)
// và OrderStatusDialog (Admin) - Đợt 10, Phần 4-5. Chỉ dùng ở nơi ĐÃ xác thực (không dùng cho
// PaymentStatusPanel/thanh-toán - trang đó public không đăng nhập, cố tình không lộ credential).
export function ProvisioningDetailsCard({
  provisionedIpAddress,
  provisionedRootPassword,
  provisionedNameservers,
}: ProvisioningDetailsCardProps) {
  if (!provisionedIpAddress && !provisionedNameservers) {
    return null;
  }

  return (
    <div className="mt-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
      <p className="text-xs font-medium text-foreground">Thông tin bàn giao</p>
      <dl className="mt-1.5 flex flex-col gap-1 font-mono text-xs">
        {provisionedIpAddress && (
          <div className="flex items-center gap-2">
            <dt className="text-muted-foreground">IP:</dt>
            <dd className="text-foreground">{provisionedIpAddress}</dd>
            <CopyValueButton value={provisionedIpAddress} label="Sao chép IP" />
          </div>
        )}
        {provisionedIpAddress &&
          (provisionedRootPassword ? (
            <div className="flex items-center gap-2">
              <dt className="text-muted-foreground">Mật khẩu root:</dt>
              <dd className="text-foreground">{provisionedRootPassword}</dd>
              <CopyValueButton value={provisionedRootPassword} label="Sao chép mật khẩu root" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <dt className="text-muted-foreground">Đăng nhập:</dt>
              <dd className="text-foreground">Bằng SSH Key đã lưu</dd>
            </div>
          ))}
        {provisionedNameservers && (
          <div className="flex items-center gap-2">
            <dt className="text-muted-foreground">Nameserver:</dt>
            <dd className="text-foreground">{provisionedNameservers}</dd>
          </div>
        )}
      </dl>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Dữ liệu mô phỏng cho mục đích demo, không phải hạ tầng thật.
      </p>
    </div>
  );
}
