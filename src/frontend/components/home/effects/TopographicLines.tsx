// Nền "Topographic Map / Contour Lines" cho Hero (thay ảnh orb hotlink cũ) - line-art SVG đơn sắc,
// dùng stroke="currentColor" ăn theo `text-foreground` nên tự đổi Đen/Trắng theo theme (.dark hiện tại
// là Trắng mờ; nếu sau này public có palette sáng thì tự thành Đen mờ, không cần asset thứ 2 hay
// invert filter). Không dùng gradient. Tĩnh hoàn toàn nên không cần "use client".
export function TopographicLines() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1600 900"
      preserveAspectRatio="none"
      className="h-full w-full text-foreground opacity-10"
      style={{
        maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 40%, transparent 85%)",
        WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 40%, transparent 85%)",
      }}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M -50,80 C 120,50 280,110 460,80 S 780,40 940,90 S 1260,60 1650,95" />
        <path d="M -50,200 C 140,165 300,225 480,195 S 800,150 960,205 S 1280,175 1650,210" />
        <path d="M -50,310 C 160,270 320,340 500,305 S 820,260 980,320 S 1300,285 1650,325" />
        <path d="M -50,420 C 130,385 310,455 490,415 S 810,375 970,435 S 1290,395 1650,440" />
        <path d="M -50,530 C 150,495 320,565 500,525 S 830,485 990,545 S 1310,505 1650,550" />
        <path d="M -50,640 C 140,600 310,675 490,635 S 820,595 980,655 S 1300,615 1650,660" />
        <path d="M -50,750 C 130,710 300,785 480,745 S 810,705 970,765 S 1290,725 1650,770" />
        <path d="M -50,860 C 150,820 320,895 500,855 S 830,815 990,875 S 1310,835 1650,880" />
      </g>
    </svg>
  );
}
