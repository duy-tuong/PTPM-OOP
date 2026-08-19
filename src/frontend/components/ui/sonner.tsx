"use client"

import { useEffect, useState } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"
import { THEME_CHANGED_EVENT } from "@/lib/theme/publicTheme"

// Toaster mount 1 lần ở root layout, dùng chung cho cả Admin (luôn :root sáng) lẫn Public (Dark/Light
// theo ThemeToggle) - trước đây gọi useTheme() của next-themes nhưng KHÔNG có ThemeProvider bao ngoài
// nên luôn no-op (fallback "system"), không đồng bộ thật với theme của trang. Đọc thẳng class ở <html>
// (cùng nguồn sự thật với ThemeToggle.tsx) thay vì phụ thuộc next-themes.
const Toaster = ({ ...props }: ToasterProps) => {
  const [theme, setTheme] = useState<ToasterProps["theme"]>("dark")

  useEffect(() => {
    function syncTheme() {
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light")
    }

    syncTheme()
    window.addEventListener(THEME_CHANGED_EVENT, syncTheme)
    return () => window.removeEventListener(THEME_CHANGED_EVENT, syncTheme)
  }, [])

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
