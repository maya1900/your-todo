import type { ReactNode } from "react";

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <main className="relative z-10 mx-auto max-w-[1080px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      {children}
    </main>
  );
}
