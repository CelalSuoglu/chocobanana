import Image from "next/image";
import Link from "next/link";
import { CountdownTimer } from "@/components/countdown-timer";
import { Star } from "@/components/star";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";

type ComingSoonPageProps = {
  dict: Dictionary;
  locale: Locale;
  endsAtIso: string | null;
};

const SPARKLES = [
  { top: "5%", left: "10%", delay: "0s", size: "text-sm", tone: "gold" },
  { top: "9%", left: "28%", delay: "0.4s", size: "text-xs", tone: "pink" },
  { top: "7%", left: "72%", delay: "1.1s", size: "text-sm", tone: "gold" },
  { top: "12%", left: "88%", delay: "0.7s", size: "text-base", tone: "pink" },
  { top: "18%", left: "6%", delay: "1.6s", size: "text-xs", tone: "gold" },
  { top: "22%", left: "48%", delay: "2.1s", size: "text-sm", tone: "pink" },
  { top: "26%", left: "82%", delay: "0.3s", size: "text-xs", tone: "gold" },
  { top: "34%", left: "14%", delay: "1.4s", size: "text-sm", tone: "pink" },
  { top: "38%", left: "92%", delay: "0.9s", size: "text-xs", tone: "gold" },
  { top: "44%", left: "8%", delay: "2.4s", size: "text-sm", tone: "gold" },
  { top: "48%", left: "58%", delay: "1.8s", size: "text-xs", tone: "pink" },
  { top: "52%", left: "86%", delay: "0.5s", size: "text-sm", tone: "pink" },
  { top: "58%", left: "22%", delay: "1.2s", size: "text-xs", tone: "gold" },
  { top: "64%", left: "78%", delay: "2.0s", size: "text-sm", tone: "pink" },
  { top: "70%", left: "12%", delay: "0.6s", size: "text-xs", tone: "pink" },
  { top: "74%", left: "42%", delay: "1.5s", size: "text-sm", tone: "gold" },
  { top: "78%", left: "68%", delay: "2.3s", size: "text-xs", tone: "gold" },
  { top: "84%", left: "30%", delay: "0.8s", size: "text-sm", tone: "pink" },
  { top: "88%", left: "90%", delay: "1.9s", size: "text-xs", tone: "gold" },
  { top: "16%", left: "34%", delay: "2.6s", size: "text-xs", tone: "gold" },
] as const;

export function ComingSoonPage({
  dict,
  locale,
  endsAtIso,
}: ComingSoonPageProps) {
  const c = dict.comingSoon;

  return (
    <main className="coming-soon-stage relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div aria-hidden="true" className="coming-soon-glow" />
      <div aria-hidden="true" className="coming-soon-sparkles">
        {SPARKLES.map((sparkle, index) => (
          <span
            key={index}
            className={`coming-soon-sparkle coming-soon-sparkle--${sparkle.tone} ${sparkle.size}`}
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
          <Star
            className="absolute -start-2 bottom-0 text-xs md:-start-4"
            style={{ animationDelay: "0.9s" }}
          />
          <Star
            className="absolute -end-1 -bottom-1 text-sm md:-end-3"
            style={{ animationDelay: "1.7s" }}
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

        <div className="divider-ornament mt-4">
          <Star className="text-sm" style={{ animationDelay: "0.6s" }} />
        </div>

        <div className="animate-rise delay-2 relative mt-8 w-full">
          <Star
            className="pointer-events-none absolute -top-3 start-[8%] text-xs"
            style={{ animationDelay: "0.4s" }}
          />
          <Star
            className="pointer-events-none absolute -top-2 end-[10%] text-sm"
            style={{ animationDelay: "1.3s" }}
          />
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

      <footer className="relative z-10 flex flex-col items-center gap-4 pb-8 pt-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <Star className="text-xs" style={{ animationDelay: "0.5s" }} />
          <p className="font-script text-sm text-chocolate-soft/75 md:text-base">
            by Didem Keskin
          </p>
          <Star className="text-xs" style={{ animationDelay: "1.1s" }} />
        </div>
        <nav
          aria-label={dict.nav.account}
          className="flex flex-wrap items-center justify-center gap-3 font-serif text-sm tracking-[0.1em] text-chocolate-soft"
        >
          <Link
            href={hrefFor(locale, "/login")}
            className="transition-colors hover:text-pink-deep"
          >
            {dict.auth.signIn}
          </Link>
          <span aria-hidden="true" className="text-pink/50">
            ·
          </span>
          <Link
            href={hrefFor(locale, "/register")}
            className="transition-colors hover:text-pink-deep"
          >
            {dict.auth.signUp}
          </Link>
        </nav>
      </footer>
    </main>
  );
}
