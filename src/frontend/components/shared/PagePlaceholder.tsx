// Placeholder dùng tạm cho Phase 6.1 - mọi route được scaffold ở đây để `npm run build` pass
// ngay từ đầu; các sub-phase sau (6.2+) chỉ điền nội dung thật vào từng page.tsx, không tạo route
// mới, giảm xung đột merge giữa các nhánh.
export function PagePlaceholder({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm text-muted-foreground">TODO - {phase}</p>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
    </div>
  );
}
