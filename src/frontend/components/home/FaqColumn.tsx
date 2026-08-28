"use client";

import { useState } from "react";
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

export function FaqColumn({ faqs }: { faqs: FaqDto[] }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-80px" }}
      variants={containerVariants}
      className="flex flex-col gap-6"
    >
      <h2 className="font-heading text-2xl font-bold text-foreground">Câu hỏi thường gặp</h2>
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

function FaqBlockItem({ faq }: { faq: FaqDto }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card/50 p-5 shadow-sm transition-all duration-300 hover:bg-card hover:shadow-md">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="group flex w-full items-start justify-between gap-4 text-left focus:outline-none"
      >
        <h3 className="font-heading text-base font-semibold text-foreground transition-colors group-hover:text-primary">
          {faq.question}
        </h3>
        <CaretDown
          className={cn("mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:text-primary", open && "rotate-180")}
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
            <p className="pt-4 text-sm leading-relaxed text-muted-foreground pr-8">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
