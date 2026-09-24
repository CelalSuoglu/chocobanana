"use client";

import { useEffect, useState } from "react";

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function splitRemaining(ms: number): Remaining {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function pad(value: number, width = 2): string {
  return String(value).padStart(width, "0");
}

type CountdownTimerProps = {
  endsAtIso: string | null;
  awaitingDate: string;
  almostHereTitle: string;
  almostHereBody: string;
};

export function CountdownTimer({
  endsAtIso,
  awaitingDate,
  almostHereTitle,
  almostHereBody,
}: CountdownTimerProps) {
  const endsAtMs = endsAtIso ? Date.parse(endsAtIso) : NaN;
  const hasEnd = Number.isFinite(endsAtMs);

  const [now, setNow] = useState(() => Date.now());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!hasEnd) return;

    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [hasEnd]);

  if (!hasEnd) {
    return (
      <p className="mx-auto max-w-md font-serif text-lg leading-relaxed text-chocolate-soft md:text-xl">
        {awaitingDate}
      </p>
    );
  }

  const remainingMs = endsAtMs - now;
  const expired = remainingMs <= 0;

  if (expired) {
    return (
      <div className="mx-auto max-w-lg animate-rise text-center">
        <p className="font-script text-3xl text-pink-deep md:text-4xl">
          {almostHereTitle}
        </p>
        <p className="mt-3 font-serif text-base leading-relaxed text-chocolate-soft md:text-lg">
          {almostHereBody}
        </p>
      </div>
    );
  }

  const remaining = splitRemaining(
    mounted ? remainingMs : Math.max(0, endsAtMs - Date.now()),
  );

  const display = `${pad(remaining.days)}:${pad(remaining.hours)}:${pad(remaining.minutes)}:${pad(remaining.seconds)}`;

  return (
    <div className="countdown-hero relative mx-auto w-full max-w-4xl px-1 text-center">
      <p
        className="countdown-glitter-line"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
      >
        {display}
      </p>
    </div>
  );
}
