"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "motion/react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export function ParticleNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [isClient, setIsClient] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const shouldHide = () => {
    if (!pathname) return false;
    
    // 1. Dashboard khách hàng / Admin
    if (pathname.startsWith('/khach-hang') || (pathname.startsWith('/admin') && pathname !== '/admin/login')) return true;
    
    // 2. Chi tiết tin tức
    if (pathname.startsWith('/tin-tuc/') && pathname !== '/tin-tuc') return true;
    
    // 3. Các trang tĩnh, cần tập trung
    const hiddenExactPaths = [
      '/lien-he',
      '/gio-hang',
    ];
    
    return hiddenExactPaths.includes(pathname);
  };

  // Client init & Theme observer
  useEffect(() => {
    setIsClient(true);
    
    // Initialize theme based on root html class
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };
    
    checkTheme();
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Canvas animation logic
  useEffect(() => {
    if (!isClient || shouldHide()) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    let particles: Particle[] = [];
    
    // Config based on theme
    const nodeColor = theme === 'dark' ? '6, 182, 212' : '71, 85, 105'; // Cyan-500 vs Slate-600
    const lineColor = theme === 'dark' ? '59, 130, 246' : '71, 85, 105'; // Blue-500 vs Slate-600
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const isMobile = window.innerWidth < 768;
      const numParticles = isMobile ? 30 : window.innerWidth < 1280 ? 50 : 80;
      
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4, // Cực chậm để thư giãn mắt
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.5 + 0.5, // 0.5 -> 2.0px
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const connectionDistance = 150;
      
      // Update & Draw
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Move (only if not reduced motion)
        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          
          // Bounce off edges smoothly
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${nodeColor}, 0.5)`;
        ctx.fill();

        // Connect to other nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            
            // Opacity decreases as distance increases
            const opacity = 1 - (distance / connectionDistance);
            // Lower overall line opacity for subtlety
            ctx.strokeStyle = `rgba(${lineColor}, ${opacity * 0.15})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(drawParticles);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawParticles();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isClient, pathname, theme, prefersReducedMotion]);

  if (!isClient || shouldHide()) return <div className="fixed inset-0 -z-20 pointer-events-none bg-background" />;

  return (
    <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden bg-background transition-colors duration-700">
      {/* 1. Base Gradient Glows (Ambient) - Kept for depth */}
      <div className="absolute inset-0 opacity-15 dark:opacity-10">
        <div className="absolute -top-[20%] -left-[10%] h-[70%] w-[50%] rounded-full bg-indigo-500 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] h-[60%] w-[40%] rounded-full bg-cyan-500 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] h-[50%] w-[60%] rounded-full bg-blue-500 blur-[120px]" />
      </div>

      {/* 2. Canvas Network */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 h-full w-full opacity-60 dark:opacity-100"
      />
    </div>
  );
}
