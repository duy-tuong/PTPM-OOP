"use client";

import { useEffect, useState } from "react";

// Thanh tiến độ đọc siêu mảnh dính mép trên cùng trình duyệt - z-50 (cao hơn Navbar pill z-40) nên luôn
// nổi trên cùng kể cả khi Navbar hiện.
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0);
    }

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-[2px] bg-transparent">
      <div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
    </div>
  );
}
