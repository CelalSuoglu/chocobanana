"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Display only. The public gate uses the database timestamps, not this clock. */
export function PublicOpeningCountdown({
  endsAtIso,
  serverNowIso,
}: {
  endsAtIso: string;
  serverNowIso: string;
}) {
  const router = useRouter();
  const endsAt = new Date(endsAtIso).getTime();
  const skew = useMemo(
    () => new Date(serverNowIso).getTime() - Date.now(),
    [serverNowIso],
  );
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const next = endsAt - (Date.now() + skew);
      setRemainingMs(next);
      if (next <= 0) router.refresh();
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endsAt, router, skew]);

  return (
    <p className="text-sm text-chocolate-soft">
      Time left:{" "}
      <span className="font-serif text-lg text-chocolate">
        {remainingMs == null ? "…" : formatRemaining(remainingMs)}
      </span>
    </p>
  );
}
