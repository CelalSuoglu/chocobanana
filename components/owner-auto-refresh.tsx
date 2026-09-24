"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Soft poll so newly paid webhook orders appear without a full page reload. */
export function OwnerAutoRefresh({ intervalMs = 20000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = window.setInterval(() => {
      router.refresh();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, router]);

  return (
    <p className="text-xs text-[#c9a27a]/70">
      Auto-refreshing every {Math.round(intervalMs / 1000)}s
    </p>
  );
}
