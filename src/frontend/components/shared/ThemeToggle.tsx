"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  THEME_CHANGED_EVENT,
  readCurrentPublicTheme,
  setPublicTheme,
  type PublicTheme,
} from "@/lib/theme/publicTheme";

// Nút chuyển Light/Dark cho public site - chỉ render ở Navbar (Admin khoá cứng sáng, không có nút này).
// Đọc theme hiện tại trong useEffect (không đoán trên server, tránh hydration mismatch - class thật đã
// do THEME_INIT_SCRIPT gắn vào <html> trước khi React hydrate) - cùng kiểu "named function trong effect"
// đã dùng ở FaqColumn.tsx (useCanHover) để né lỗi lint react-hooks/set-state-in-effect.
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<PublicTheme>("dark");

  useEffect(() => {
    function syncTheme() {
      setTheme(readCurrentPublicTheme());
    }

    syncTheme();
    window.addEventListener(THEME_CHANGED_EVENT, syncTheme);
    return () => window.removeEventListener(THEME_CHANGED_EVENT, syncTheme);
  }, []);

  function handleToggle() {
    setPublicTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      className={className}
    >
      {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}
