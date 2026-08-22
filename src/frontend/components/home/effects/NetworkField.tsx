"use client";

import { useEffect, useRef } from "react";
import { THEME_CHANGED_EVENT } from "@/lib/theme/publicTheme";

// Nền động "data mesh" - thay cho ShaderBackground (hiệu ứng cực quang WebGL đã bỏ theo yêu cầu).
// Cố định toàn màn hình (`fixed inset-0`), luôn hoạt động ở layer dưới cùng xuyên suốt trang, không
// còn giới hạn trong khung Hero như trước. `pointer-events-none` để không chặn click/hover nội dung
// phía trên.
interface NetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const NODE_COUNT = 70;
const CONNECT_DISTANCE = 130;

export function NetworkField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // canvas 2D không đọc trực tiếp CSS custom property được - "mượn" 1 element, gán color: var(--primary)
    // rồi đọc lại getComputedStyle().color (browser tự resolve ra "rgb(r, g, b)") để lấy đúng giá trị
    // --primary thật của theme đang active, thay vì hardcode rgba(0, 240, 255, ...) chỉ đúng cho dark mode.
    let primaryRgb = "0, 240, 255";
    function resolvePrimaryRgb() {
      canvas!.style.color = "var(--primary)";
      const resolved = getComputedStyle(canvas!).color;
      const match = resolved.match(/\d+(\.\d+)?/g);
      if (match && match.length >= 3) {
        primaryRgb = `${match[0]}, ${match[1]}, ${match[2]}`;
      }
    }
    resolvePrimaryRgb();
    window.addEventListener(THEME_CHANGED_EVENT, resolvePrimaryRgb);

    let width = 0;
    let height = 0;
    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = canvas!.width = rect.width;
      height = canvas!.height = rect.height;
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const nodes: NetworkNode[] = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));

    const mouse = { x: -1000, y: -1000, active: false };
    function handleWindowPointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
      mouse.active = inside;
      if (inside) {
        mouse.x = x;
        mouse.y = y;
      }
    }
    window.addEventListener("pointermove", handleWindowPointerMove);

    let rafId = 0;
    function draw() {
      ctx!.clearRect(0, 0, width, height);

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x <= 0 || node.x >= width) node.vx *= -1;
        if (node.y <= 0 || node.y >= height) node.vy *= -1;
        node.x = Math.max(0, Math.min(width, node.x));
        node.y = Math.max(0, Math.min(height, node.y));
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DISTANCE) {
            ctx!.strokeStyle = `rgba(${primaryRgb}, ${0.15 * (1 - dist / CONNECT_DISTANCE)})`;
            ctx!.lineWidth = 0.5;
            ctx!.beginPath();
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            ctx!.stroke();
          }
        }
      }

      nodes.forEach((node) => {
        const nearMouse = mouse.active && Math.hypot(node.x - mouse.x, node.y - mouse.y) < 120;
        ctx!.fillStyle = nearMouse ? `rgba(${primaryRgb}, 0.6)` : `rgba(${primaryRgb}, 0.3)`;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, nearMouse ? 2.5 : 1.3, 0, Math.PI * 2);
        ctx!.fill();
      });

      rafId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener(THEME_CHANGED_EVENT, resolvePrimaryRgb);
      window.removeEventListener("pointermove", handleWindowPointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 -z-20 h-full w-full" />;
}

// 3. Vẽ Floating Glass Panes
panes.forEach(pane => {
  pane.x += pane.vx;
  pane.y += pane.vy;

  // Wrap around biên mượt mà
  if (pane.x < -pane.width - 50) pane.x = width + 50;
  if (pane.x > width + 50) pane.x = -pane.width - 50;
  if (pane.y < -pane.height - 50) pane.y = height + 50;
  if (pane.y > height + 50) pane.y = -pane.height - 50;

  ctx!.beginPath();
  if (ctx!.roundRect) {
    ctx!.roundRect(pane.x, pane.y, pane.width, pane.height, pane.borderRadius);
  } else {
    ctx!.rect(pane.x, pane.y, pane.width, pane.height); // Fallback
  }

  ctx!.fillStyle = `rgba(${pane.colorRgb}, 0.015)`;
  ctx!.fill();
  ctx!.strokeStyle = `rgba(${pane.colorRgb}, 0.1)`;
  ctx!.stroke();
});

// 4. Vẽ Flowing Nodes (Các điểm sáng di chuyển)
nodes.forEach(node => {
  const line = lines[node.lineIndex];
  const maxDist = line.isVertical ? height : width;

  node.progress += node.speed * node.direction;
  if (node.progress > maxDist + 20) node.progress = -20;
  if (node.progress < -20) node.progress = maxDist + 20;

  let nx = 0;
  let ny = 0;
  if (line.isVertical) {
    nx = line.position;
    ny = node.progress;
  } else {
    nx = node.progress;
    ny = line.position;
  }

  // Lõi sáng
  ctx!.beginPath();
  ctx!.fillStyle = `rgba(${node.colorRgb}, 0.8)`;
  ctx!.arc(nx, ny, 2.5, 0, Math.PI * 2);
  ctx!.fill();

  // Hào quang tỏa ra
  ctx!.beginPath();
  ctx!.fillStyle = `rgba(${node.colorRgb}, 0.25)`;
  ctx!.arc(nx, ny, 7, 0, Math.PI * 2);
  ctx!.fill();
});

rafId = requestAnimationFrame(draw);
    }
draw();

return () => {
  resizeObserver.disconnect();
  window.removeEventListener(THEME_CHANGED_EVENT, resolvePrimaryRgb);
  if (rafId) cancelAnimationFrame(rafId);
};
  }, []);

return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 -z-20 h-full w-full" />;
}
