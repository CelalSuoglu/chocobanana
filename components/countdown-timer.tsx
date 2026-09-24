"use client";

import { Fragment, useEffect, useState } from "react";

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export type CountdownLabels = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
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
      <p className="coming-soon-awaiting">{awaitingDate}</p>
    );
  }

  const remainingMs = endsAtMs - now;
  const expired = remainingMs <= 0;

  if (expired) {
    return (
      <div className="coming-soon-expired">
        <p className="coming-soon-expired-title">{almostHereTitle}</p>
        <p className="coming-soon-expired-body">{almostHereBody}</p>
      </div>
    );
  }

  const remaining = splitRemaining(
    mounted ? remainingMs : Math.max(0, endsAtMs - Date.now()),
  );

  const units: { key: keyof Remaining; label: string; value: string }[] = [
    { key: "days", label: labels.days, value: pad(remaining.days) },
    { key: "hours", label: labels.hours, value: pad(remaining.hours) },
    { key: "minutes", label: labels.minutes, value: pad(remaining.minutes) },
    { key: "seconds", label: labels.seconds, value: pad(remaining.seconds) },
  ];

  return (
    <div
      className="coming-soon-timer"
      role="timer"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="coming-soon-timer-row">
        {units.map((unit, index) => (
          <Fragment key={unit.key}>
            <div className="coming-soon-timer-unit">
              <span className="coming-soon-timer-digit">{unit.value}</span>
              <span className="coming-soon-timer-label">{unit.label}</span>
            </div>
            {index < units.length - 1 ? (
              <span className="coming-soon-timer-colon" aria-hidden="true">
                :
              </span>
            ) : null}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
