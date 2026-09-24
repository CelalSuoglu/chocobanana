"use client";

import { useEffect, useState } from "react";

export type CountdownLabels = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

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

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

type CountdownTimerProps = {
  endsAtIso: string | null;
  labels: CountdownLabels;
  awaitingDate: string;
  almostHereTitle: string;
  almostHereBody: string;
};

export function CountdownTimer({
  endsAtIso,
  labels,
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

  // Avoid hydration mismatch: server + first client paint share the same
  // endsAtIso-derived remaining from "now" only after mount.
  const remaining = splitRemaining(
    mounted ? remainingMs : Math.max(0, endsAtMs - Date.now()),
  );

  const units: { key: keyof Remaining; label: string; value: string }[] = [
    { key: "days", label: labels.days, value: String(remaining.days) },
    { key: "hours", label: labels.hours, value: pad(remaining.hours) },
    { key: "minutes", label: labels.minutes, value: pad(remaining.minutes) },
    { key: "seconds", label: labels.seconds, value: pad(remaining.seconds) },
  ];

  return (
    <div
      className="countdown-glitter relative mx-auto w-full max-w-xl px-1"
      role="timer"
      aria-live="polite"
      aria-atomic="true"
    >
      <span aria-hidden="true" className="countdown-glitter-dust" />
      <div className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {units.map((unit, index) => (
          <div
            key={unit.key}
            className="countdown-unit relative flex flex-col items-center justify-center overflow-hidden px-3 py-4 sm:py-5"
            style={{ animationDelay: `${index * 0.12}s` }}
          >
            <span aria-hidden="true" className="countdown-unit-shine" />
            <span
              aria-hidden="true"
              className="countdown-unit-star absolute start-2 top-2 text-[0.55rem] text-gold"
              style={{ animationDelay: `${0.4 + index * 0.2}s` }}
            >
              ✦
            </span>
            <span
              aria-hidden="true"
              className="countdown-unit-star absolute end-2.5 bottom-2 text-[0.45rem] text-pink-deep"
              style={{ animationDelay: `${1.1 + index * 0.25}s` }}
            >
              ✦
            </span>
            <span className="countdown-digit">{unit.value}</span>
            <span className="relative mt-2 font-serif text-[0.65rem] tracking-[0.2em] uppercase text-chocolate-soft/80 sm:text-xs">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
