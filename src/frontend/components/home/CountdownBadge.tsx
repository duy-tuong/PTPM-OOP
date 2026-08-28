"use client";

import { useEffect, useState } from "react";

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
    <div className="flex min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-lg border border-border bg-card/60 px-2 py-1.5 shadow-sm">
      <span className="font-mono text-xl font-extrabold text-primary tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">{label}</span>
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
    return <span className="font-mono text-sm font-medium text-muted-foreground">Đã kết thúc</span>;
  }

  const parts = remainingMs === null ? { days: 0, hours: 0, minutes: 0 } : computeParts(remainingMs);

  return (
    <div className="flex items-center gap-2">
      <TimeBlock value={parts.days} label="Ngày" />
      <span className="font-mono text-lg font-bold text-primary/30">:</span>
      <TimeBlock value={parts.hours} label="Giờ" />
      <span className="font-mono text-lg font-bold text-primary/30">:</span>
      <TimeBlock value={parts.minutes} label="Phút" />
    </div>
  );
}
