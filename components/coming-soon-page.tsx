import Image from "next/image";
import { CountdownTimer } from "@/components/countdown-timer";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ComingSoonPageProps = {
  dict: Dictionary;
  endsAtIso: string | null;
};

export function ComingSoonPage({ dict, endsAtIso }: ComingSoonPageProps) {
  const c = dict.comingSoon;

  return (
    <main className="coming-soon-stage">
      <div className="coming-soon-frame">
        <Image
          src="/coming-soon-art-live.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 576px) 100vw, 576px"
          className="coming-soon-art"
        />

        {/* Real brand logo over the art logo mark */}
        <div className="coming-soon-logo-slot">
          <div className="coming-soon-logo-ring">
            <Image
              src="/logo.jpg"
              alt={dict.a11y.logoAlt}
              width={160}
              height={160}
              priority
              className="coming-soon-logo"
            />
          </div>
        </div>

        {/* Live timer covering the static countdown in the art */}
        <div className="coming-soon-timer-slot">
          <div aria-hidden="true" className="coming-soon-timer-scrim" />
          <CountdownTimer
            endsAtIso={endsAtIso}
            labels={{
              days: c.days,
              hours: c.hours,
              minutes: c.minutes,
              seconds: c.seconds,
            }}
            awaitingDate={c.awaitingDate}
            almostHereTitle={c.almostHereTitle}
            almostHereBody={c.almostHereBody}
          />
        </div>
      </div>
    </main>
  );
}
