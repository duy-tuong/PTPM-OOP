"use client";

export const THEME_STORAGE_KEY = "cloudverse-theme";
export const THEME_CHANGED_EVENT = "cloudverse-theme-changed";

export type PublicTheme = "light" | "dark";

// Đọc/ghi theme của public site thẳng vào class ở <html> (không qua Context/Provider) - cùng nguồn sự
// thật với THEME_INIT_SCRIPT (app/layout.tsx) và cùng convention CustomEvent-để-đồng-bộ đã có sẵn ở
// lib/auth/customerSessionClient.ts (Navbar tự nghe sự kiện để cập nhật UI, không cần remount/prop drilling).
export function readCurrentPublicTheme(): PublicTheme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

export function setPublicTheme(theme: PublicTheme): void {
  document.documentElement.classList.remove(theme === "light" ? "dark" : "light");
  document.documentElement.classList.add(theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new CustomEvent(THEME_CHANGED_EVENT, { detail: theme }));
}
