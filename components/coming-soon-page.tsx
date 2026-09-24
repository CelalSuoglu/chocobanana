import Image from "next/image";
import { CountdownTimer } from "@/components/countdown-timer";
import { Star } from "@/components/star";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ComingSoonPageProps = {
  dict: Dictionary;
  endsAtIso: string | null;
};

const SPARKLES = [
  { top: "8%", left: "12%", delay: "0s", size: "text-sm" },
  { top: "14%", left: "78%", delay: "0.7s", size: "text-base" },
  { top: "28%", left: "6%", delay: "1.4s", size: "text-xs" },
  { top: "36%", left: "88%", delay: "0.3s", size: "text-sm" },
  { top: "58%", left: "18%", delay: "1.1s", size: "text-xs" },
  { top: "62%", left: "82%", delay: "1.8s", size: "text-sm" },
  { top: "78%", left: "40%", delay: "0.5s", size: "text-xs" },
  { top: "22%", left: "48%", delay: "2.1s", size: "text-sm" },
  { top: "48%", left: "8%", delay: "2.4s", size: "text-xs" },
  { top: "52%", left: "92%", delay: "1.6s", size: "text-sm" },
] as const;

export function ComingSoonPage({ dict, endsAtIso }: ComingSoonPageProps) {
  const c = dict.comingSoon;

  return (
    <main className="coming-soon-stage relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div aria-hidden="true" className="coming-soon-glow" />
      <div aria-hidden="true" className="coming-soon-sparkles">
        {SPARKLES.map((sparkle, index) => (
          <span
            key={index}
            className={`coming-soon-sparkle ${sparkle.size}`}
            style={{
              top: sparkle.top,
              left: sparkle.left,
              animationDelay: sparkle.delay,
            }}
          >
            ✦
          </span>
        ))}
      </div>

      <div className="section-pad relative z-10 flex flex-1 flex-col items-center justify-center py-12 text-center md:py-16">
        <div className="animate-rise relative">
          <Star
            className="absolute -start-6 -top-1 text-base md:-start-9 md:text-lg"
            style={{ animationDelay: "0.35s" }}
          />
          <Star
            className="absolute -end-5 top-8 text-sm md:-end-8"
            style={{ animationDelay: "1.2s" }}
          />
          <div className="animate-float mx-auto overflow-hidden rounded-full bg-paper/70 p-2.5 shadow-[0_16px_48px_rgba(60,42,34,0.1)] ring-1 ring-pink/40">
            <Image
              src="/logo.jpg"
              alt={dict.a11y.logoAlt}
              width={168}
              height={168}
              priority
              className="h-28 w-28 rounded-full object-cover sm:h-36 sm:w-36 md:h-40 md:w-40"
            />
          </div>
        </div>

        <h1 className="animate-rise delay-1 mt-8 font-script text-3xl text-pink-deep sm:text-4xl md:text-[2.75rem]">
          {c.eyebrow}
        </h1>

        <div className="animate-rise delay-2 mt-10 w-full">
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

      <footer className="relative z-10 pb-8 pt-2 text-center">
        <p className="font-script text-sm text-chocolate-soft/75 md:text-base">
          by Didem Keskin
        </p>
      </footer>
    </main>
  );
}
