import { ScrollReveal } from "@/components/home/ScrollReveal";

// Chuỗi node kết nối theo chiều dọc, dùng chung cho 3 section "flow" tĩnh (Cloudverse là gì / Vì sao ra
// đời / Định hướng tương lai) - mirror đúng ASCII flow trong nội dung gốc (A -> B -> C...). Vertical thay
// vì horizontal để tự động responsive ở mọi breakpoint mà không cần logic riêng cho mobile. Chỉ dùng
// ScrollReveal (fade+slide có sẵn) cho từng node, không cần canvas/SVG path-drawing.
export function NodeFlow({ nodes }: { nodes: { label: string }[] }) {
  return (
    <div className="flex flex-col items-center">
      {nodes.map((node, index) => (
        <div key={node.label} className="flex flex-col items-center">
          <ScrollReveal delay={index * 0.1}>
            <div className="glass-card rounded-full border border-border px-6 py-2.5 text-center">
              <span className="text-sm font-semibold text-foreground sm:text-base">{node.label}</span>
            </div>
          </ScrollReveal>
          {index < nodes.length - 1 && (
            <span aria-hidden className="my-1.5 h-8 w-px bg-gradient-to-b from-primary/50 to-primary/5" />
          )}
        </div>
      ))}
    </div>
  );
}
