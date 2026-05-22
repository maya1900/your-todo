import { useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { AboutDialog } from "@/components/ui/AboutDialog";

export interface HeaderProps {
  onExport: () => void;
  onImport: () => void;
}

export function Header({ onExport, onImport }: HeaderProps) {
  const [stuck, setStuck] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      setStuck(window.scrollY > 80);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={[
          "sticky top-0 z-30 h-16 backdrop-blur supports-[backdrop-filter]:bg-paper-50/70 bg-paper-50/90 transition-colors duration-200",
          stuck ? "border-b border-ink-900" : "border-b border-rule-400",
        ].join(" ")}
      >
        <div className="mx-auto flex h-full max-w-[1080px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline gap-4">
            <div className="font-display text-[22px] font-medium tracking-tight">
              YOUR<span className="mx-2 text-stamp-600">·</span>TODO
            </div>
            <span className="font-mono hidden sm:inline text-[11px] tracking-[0.2em] text-ink-500">
              №.INDEX
            </span>
          </div>
          <nav className="flex items-center gap-1" aria-label="顶部操作">
            <IconButton aria-label="导出数据" onClick={onExport}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
              </svg>
            </IconButton>
            <IconButton aria-label="导入数据" onClick={onImport}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M12 21V9m0 0l-4 4m4-4l4 4M5 3h14" />
              </svg>
            </IconButton>
            <IconButton aria-label="关于" onClick={() => setAboutOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
              </svg>
            </IconButton>
          </nav>
        </div>
      </header>
      <div ref={sentinelRef} aria-hidden="true" />
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}
