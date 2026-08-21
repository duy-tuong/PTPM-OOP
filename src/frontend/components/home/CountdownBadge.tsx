"use client";

import { useEffect, useState } from "react";

// Đếm ngược thật tới `targetIso` (Promotion.endDate thật, không phải giờ:phút:giây bịa như bản Stitch
// tham khảo). Tách Ngày/Giờ/Phút thành 3 khối vuông riêng (kiểu Bento nhỏ) thay vì 1 chuỗi text liền -
// state ban đầu để null và chỉ tính trong useEffect để tránh lệch giữa SSR và lần render đầu trên
// client (hydration mismatch).
interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
}

function computeParts(ms: number): TimeParts {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
  };
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-14 flex-col items-center gap-1 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2">
      <span className="font-mono text-2xl font-bold text-primary tabular-nums">{String(value).padStart(2, "0")}</span>
      <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">{label}</span>
    </div>
  );
}

export function CountdownBadge({ targetIso }: { targetIso: string }) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    function tick() {
      setRemainingMs(new Date(targetIso).getTime() - Date.now());
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (remainingMs !== null && remainingMs <= 0) {
    return <span className="font-mono text-sm text-muted-foreground">Đã kết thúc</span>;
  }

  const parts = remainingMs === null ? { days: 0, hours: 0, minutes: 0 } : computeParts(remainingMs);

  return (
    <div className="flex items-center gap-2">
      <TimeBlock value={parts.days} label="Ngày" />
      <span className="font-mono text-xl text-muted-foreground">:</span>
      <TimeBlock value={parts.hours} label="Giờ" />
      <span className="font-mono text-xl text-muted-foreground">:</span>
      <TimeBlock value={parts.minutes} label="Phút" />
    </div>
  );
}
