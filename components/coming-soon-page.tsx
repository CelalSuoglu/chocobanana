import Image from "next/image";
import Link from "next/link";
import { CountdownTimer } from "@/components/countdown-timer";
import { Star } from "@/components/star";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";
import {
  SITE_EMAIL,
  SITE_INSTAGRAM_HANDLE,
  SITE_INSTAGRAM_URL,
} from "@/lib/site-contact";

type ComingSoonPageProps = {
  dict: Dictionary;
  locale: Locale;
  endsAtIso: string | null;
};

const SPARKLES = [
  { top: "8%", left: "8%", delay: "0s", size: "text-xs", tone: "gold" },
  { top: "12%", left: "90%", delay: "1.1s", size: "text-xs", tone: "pink" },
  { top: "78%", left: "10%", delay: "0.6s", size: "text-xs", tone: "gold" },
  { top: "84%", left: "88%", delay: "1.6s", size: "text-xs", tone: "pink" },
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
            className="absolute -start-5 -top-1 text-xs md:-start-7"
            style={{ animationDelay: "0.35s" }}
          />
          <Star
            className="absolute -end-4 top-6 text-xs md:-end-6"
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

        <h1 className="animate-rise delay-1 mt-8 font-script text-3xl text-chocolate sm:text-4xl md:text-[2.75rem]">
          {c.eyebrow}
        </h1>

        <div className="divider-ornament mt-4">
          <Star className="text-sm" style={{ animationDelay: "0.6s" }} />
        </div>

        <div className="animate-rise delay-2 relative mt-8 w-full">
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
        <div className="flex flex-col items-center gap-2 text-sm text-chocolate-soft">
          <a
            href={`mailto:${SITE_EMAIL}`}
            className="font-serif tracking-wide transition-colors hover:text-pink-deep"
          >
            {SITE_EMAIL}
          </a>
          <a
            href={SITE_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-serif tracking-wide transition-colors hover:text-pink-deep"
          >
            {dict.footer.instagram}: {SITE_INSTAGRAM_HANDLE}
          </a>
        </div>
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
