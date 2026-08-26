"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FacebookLogo, XLogo, LinkSimple } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// Cột phải "Tác giả & Thẻ & Chia sẻ". Khối Tác giả từng bị bỏ vì NewsArticleDetailDto chưa có field
// author (dựng lúc đó sẽ là bịa dữ liệu) - Đợt 6 đã expose AuthorName thật (NewsArticle.Author.FullName)
// nên phục hồi đúng vị trí này. Tags dùng đúng article.tags thật đã có; Chia sẻ không cần dữ liệu, chỉ
// cần URL trang hiện tại - đọc window.location.href trong useEffect (tránh hydration mismatch, cùng
// kiểu đã dùng cho theme/session ở nơi khác).
export function ArticleSidebar({ tags, authorName }: { tags: string[]; authorName: string }) {
  return (
    <div className="hidden lg:sticky lg:top-32 lg:col-start-3 lg:flex lg:h-fit lg:flex-col lg:gap-8">
      {authorName && (
        <div>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Tác giả</p>
          <p className="mt-3 text-sm font-medium text-foreground">{authorName}</p>
        </div>
      )}

      {tags.length > 0 && (
        <div>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Thẻ</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Chia sẻ</p>
        <ShareButtons />
      </div>
    </div>
  );
}

function ShareButtons() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function readUrl() {
      setUrl(window.location.href);
    }
    readUrl();
  }, []);

  async function handleCopy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Đã sao chép liên kết");
    setTimeout(() => setCopied(false), 2000);
  }

  const buttonClass =
    "flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary";

  return (
    <div className="mt-3 flex gap-2">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chia sẻ lên Facebook"
        className={buttonClass}
      >
        <FacebookLogo className="size-4" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chia sẻ lên X"
        className={buttonClass}
      >
        <XLogo className="size-4" />
      </a>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Sao chép liên kết"
        className={cn(buttonClass, copied && "border-primary text-primary")}
      >
        <LinkSimple className="size-4" />
      </button>
    </div>
  );
}
