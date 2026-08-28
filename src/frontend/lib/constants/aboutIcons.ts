import type { ComponentType } from "react";
import type { IconWeight } from "@phosphor-icons/react";
import {
  ShieldCheck,
  Sparkle,
  Eye,
  LockKey,
  Lightbulb,
  Handshake,
  User,
  Code,
  Buildings,
  Cloud,
  Cpu,
  HardDrives,
  At,
  CloudArrowUp,
} from "@phosphor-icons/react/dist/ssr";

// Map iconKey -> icon Phosphor cho trang Giới thiệu (Core Values/Audience/Ecosystem) - nội dung 100%
// tĩnh (lib/constants/about.ts), mirror convention serviceCategoryIcons.ts nhưng gộp chung 1 bảng vì cả
// 3 section đều là icon trang trí tĩnh, không cần validate allow-list phía server (không có server).
export type AboutIcon = ComponentType<{ className?: string; weight?: IconWeight }>;

const ABOUT_ICONS: Record<string, AboutIcon> = {
  "shield-check": ShieldCheck,
  sparkle: Sparkle,
  eye: Eye,
  lock: LockKey,
  lightbulb: Lightbulb,
  handshake: Handshake,
  user: User,
  code: Code,
  buildings: Buildings,
  cloud: Cloud,
  cpu: Cpu,
  "hard-drives": HardDrives,
  at: At,
  "lock-key": LockKey,
  "cloud-arrow-up": CloudArrowUp,
};

export function getAboutIcon(iconKey: string): AboutIcon {
  return ABOUT_ICONS[iconKey] ?? Sparkle;
}
