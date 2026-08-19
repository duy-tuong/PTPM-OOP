"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CaretDown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { FaqDto } from "@/lib/types/content";

const containerVariants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] as const, staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as const } },
};

// Cột phải "Câu Hỏi Thường Gặp" - trượt từ phải sang khi cuộn tới, item bên trong stagger qua chính
// container. Khối lớn dùng .glass-card (đồng bộ Bento/Featured Plans/Promotion) - zoom + vầng sáng
// khi hover chỉ áp cho từng khối FAQ nhỏ bên trong, xem FaqBlockItem.
export function FaqColumn({ faqs }: { faqs: FaqDto[] }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-80px" }}
      variants={containerVariants}
      className="glass-card flex flex-col gap-8 rounded-xl p-10"
    >
      <h2 className="font-heading text-2xl font-bold">Câu Hỏi Thường Gặp</h2>
      <div className="flex flex-col gap-4">
        {faqs.map((faq) => (
          <motion.div key={faq.id} variants={itemVariants}>
            <FaqBlockItem faq={faq} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Phát hiện thiết bị có hỗ trợ hover thật (chuột) hay không - false trên cảm ứng/mobile. Tính trong
// useEffect (không đoán trên server) để tránh hydration mismatch, mirror pattern đã dùng cho
// prefers-reduced-motion/CountdownBadge.
function useCanHover() {
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    function detectHover() {
      setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    }
    detectHover();
  }, []);

  return canHover;
}

function FaqBlockItem({ faq }: { faq: FaqDto }) {
  const canHover = useCanHover();
  const [open, setOpen] = useState(false);

  const hoverHandlers = canHover
    ? { onMouseEnter: () => setOpen(true), onMouseLeave: () => setOpen(false) }
    : {};

  return (
    <div
      {...hoverHandlers}
      className={cn(
        "rounded-lg border bg-white/[0.02] p-5 transition-all duration-300",
        open
          ? "scale-[1.02] border-primary shadow-[0_0_40px_-4px_color-mix(in_oklch,var(--primary)_40%,transparent)]"
          : "scale-100 border-border/50",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <h3 className="font-heading text-base">{faq.question}</h3>
        <CaretDown
          className={cn("size-4 shrink-0 text-primary transition-transform duration-300", open && "rotate-180")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-sm text-muted-foreground">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
