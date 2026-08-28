"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";

function subscribeNoop() {
  return () => {};
}

// Phát hiện "đã ở client" theo cách an toàn hydration mà KHÔNG cần setState trong effect (khác
// ParticleNetworkBackground.tsx đang dùng useEffect(() => setIsClient(true)) - cách đó bị
// react-hooks/set-state-in-effect gắn cờ lỗi ở bản eslint-plugin-react-hooks hiện tại của dự án).
// Server luôn trả getServerSnapshot() = false; sau khi hydrate, client tự đọc lại getSnapshot() = true.
function useIsClient() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

interface TrailPoint {
  x: number;
  y: number;
  t: number;
}

// Thời gian sống của 1 điểm trong vệt (ms) - vừa quyết định độ dài vệt khi rê nhanh, vừa tự quyết định
// tốc độ vệt "tan biến" khi con trỏ dừng lại (không cần logic decay tách riêng - điểm cũ tự bị lọc bỏ
// mỗi khung hình khi quá tuổi, dù không có pointermove mới nào đến).
const TRAIL_LIFETIME_MS = 400;
const MAX_LINE_WIDTH = 4;

// "Vệt sáng mượt" bám theo con trỏ chuột thật - mirror khung sườn của ParticleNetworkBackground.tsx
// (isClient gate tránh SSR mismatch, theme sáng/tối qua MutationObserver trên document.documentElement,
// useReducedMotion, vòng lặp requestAnimationFrame, resize canvas) nhưng thay phần "particle field" bằng
// thuật toán vẽ ribbon: mỗi lần pointermove lưu {x,y,t}, mỗi khung hình lọc bỏ điểm quá TRAIL_LIFETIME_MS
// rồi nối các điểm còn lại bằng quadraticCurveTo (làm mượt, tránh gãy khúc) với độ dày/độ mờ giảm dần từ
// đầu (tại con trỏ) về cuối vệt. Dùng ĐÚNG cặp màu cyan-500/blue-600 đã hardcode trong
// ParticleNetworkBackground.tsx (không đọc --primary) để cùng 1 "họ" hiệu ứng network/glow với nền canvas
// đã có, không lệch tông với màu nút/link. Chỉ chạy trên thiết bị có con trỏ hover thật
// (matchMedia("(pointer: fine)")) - hiệu ứng vô nghĩa trên cảm ứng, khác các hiệu ứng cursor cũ trong dự
// án (MagneticButton/SpotlightCard) vốn suy biến êm về "không làm gì" trên touch chứ không có guard riêng.
export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isClient = useIsClient();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    };

    checkTheme();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isClient || prefersReducedMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let points: TrailPoint[] = [];

    // Dark = cyan-500, light = blue-600 - đúng cặp màu ParticleNetworkBackground.tsx đang dùng cho
    // node/line, giữ thống nhất ngôn ngữ màu của "họ" hiệu ứng network/glow toàn site.
    const color = theme === "dark" ? "6, 182, 212" : "37, 99, 235";

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handlePointerMove = (e: PointerEvent) => {
      points.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    };

    const drawTrail = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = performance.now();
      points = points.filter((p) => now - p.t < TRAIL_LIFETIME_MS);

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = `rgba(${color}, 0.8)`;

      // Làm mượt đường tự do theo kỹ thuật chuẩn: mỗi đoạn cong đi từ trung điểm(prev,curr) tới trung
      // điểm(curr,next), dùng chính "curr" làm điểm điều khiển (quadraticCurveTo) - cần đủ 3 điểm liên
      // tiếp mới vẽ được nên bỏ qua 2 điểm ở 2 đầu mảng. Ghép nối tiếp các đoạn cong này tạo thành 1
      // đường liền mượt thay vì các đoạn thẳng gãy khúc nối trực tiếp điểm-tới-điểm.
      for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];
        const age = now - curr.t;
        const life = 1 - age / TRAIL_LIFETIME_MS; // 1 = vừa vẽ (tại con trỏ) -> 0 = sắp biến mất

        const startX = (prev.x + curr.x) / 2;
        const startY = (prev.y + curr.y) / 2;
        const endX = (curr.x + next.x) / 2;
        const endY = (curr.y + next.y) / 2;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(curr.x, curr.y, endX, endY);
        ctx.lineWidth = Math.max(MAX_LINE_WIDTH * life, 0.5);
        ctx.shadowBlur = 8 * life;
        ctx.strokeStyle = `rgba(${color}, ${life * 0.7})`;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(drawTrail);
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("pointermove", handlePointerMove);
    resizeCanvas();
    drawTrail();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isClient, theme, prefersReducedMotion]);

  if (!isClient || prefersReducedMotion) return null;

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[60]" />;
}
