"use client";

import { useEffect, useState } from "react";

// Đếm ngược thật tới `targetIso` (Promotion.endDate thật, không phải giờ:phút:giây bịa như bản Stitch
// tham khảo). Hiện "Xd Xh" nếu còn >24h, chuyển sang HH:MM:SS khi còn <24h. State ban đầu để null và
// chỉ tính trong useEffect để tránh lệch giữa SSR và lần render đầu trên client (hydration mismatch).
function formatRemaining(ms: number): string {
  if (ms <= 0) return "Đã kết thúc";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  if (days >= 1) {
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    return `Còn ${days} ngày ${hours} giờ`;
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, "0")).join(":");
}

export function CountdownBadge({ targetIso }: { targetIso: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    function tick() {
      setRemaining(new Date(targetIso).getTime() - Date.now());
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return (
    <span className="rounded border border-primary/20 bg-primary/10 px-2 py-1 font-mono text-primary tabular-nums">
      {remaining === null ? "--:--:--" : formatRemaining(remaining)}
    </span>
  );
}
