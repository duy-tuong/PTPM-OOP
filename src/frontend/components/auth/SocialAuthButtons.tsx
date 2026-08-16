"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Logo Google + GitHub - lucide-react (bản đang dùng) đã bỏ hẳn icon thương hiệu (không có "Github"
// export, chỉ còn icon git-workflow như GitBranch/GitFork), nên cả 2 đều dùng inline SVG, không phụ
// thuộc ảnh ngoài.
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A11.998 11.998 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A11.998 11.998 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.61l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.04-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.02 2.89-.02 3.29 0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  );
}

// Social login chưa nối OAuth thật (không có backend hỗ trợ) - bấm vào báo trạng thái thật thay vì im
// lặng không phản hồi, tránh tạo cảm giác nút bị hỏng.
export function SocialAuthButtons() {
  function handleClick(provider: string) {
    toast.info(`Đăng nhập bằng ${provider} đang được phát triển`);
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => handleClick("Google")}
        className="gap-2 border-white/10 bg-white/[0.03] hover:bg-white/[0.08]"
      >
        <GoogleIcon />
        Tiếp tục với Google
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleClick("GitHub")}
        className="gap-2 border-white/10 bg-white/[0.03] hover:bg-white/[0.08]"
      >
        <GitHubIcon />
        Tiếp tục với GitHub
      </Button>
    </div>
  );
}
