import type { ComponentType } from "react";
import type { IconWeight } from "@phosphor-icons/react";
import {
  Cpu,
  HardDrives,
  At,
  EnvelopeSimple,
  LockKey,
  ShieldCheck,
  CloudArrowUp,
} from "@phosphor-icons/react/dist/ssr";

// Map slug -> icon Phosphor dùng chung giữa ServicesBentoSection (Trang chủ) và ServicesZigzagList
// (/dich-vu) - tách ra 1 nơi để không lệch icon giữa 2 chỗ khi Admin thêm/sửa danh mục.
export type ServiceCategoryIcon = ComponentType<{ className?: string; weight?: IconWeight }>;

const CATEGORY_ICONS: Record<string, ServiceCategoryIcon> = {
  vps: Cpu,
  hosting: HardDrives,
  domain: At,
  "email-doanh-nghiep": EnvelopeSimple,
  ssl: LockKey,
  "firewall-chong-ddos": ShieldCheck,
  "cloud-backup": CloudArrowUp,
};

export function getCategoryIcon(slug: string): ServiceCategoryIcon {
  return CATEGORY_ICONS[slug] ?? Cpu;
}
