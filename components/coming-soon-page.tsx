import Image from "next/image";
import { CountdownTimer } from "@/components/countdown-timer";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ComingSoonPageProps = {
  dict: Dictionary;
  endsAtIso: string | null;
};

const STARS = [
  { top: "6%", left: "8%", size: "sm", delay: "0s" },
  { top: "10%", left: "22%", size: "xs", delay: "0.8s" },
  { top: "5%", left: "48%", size: "md", delay: "1.4s" },
  { top: "12%", left: "68%", size: "sm", delay: "0.3s" },
  { top: "7%", left: "88%", size: "xs", delay: "1.9s" },
  { top: "28%", left: "5%", size: "sm", delay: "1.1s" },
  { top: "34%", left: "16%", size: "xs", delay: "2.2s" },
  { top: "26%", left: "82%", size: "md", delay: "0.5s" },
  { top: "38%", left: "92%", size: "sm", delay: "1.6s" },
  { top: "48%", left: "10%", size: "xs", delay: "2.5s" },
  { top: "52%", left: "86%", size: "sm", delay: "0.9s" },
  { top: "62%", left: "18%", size: "md", delay: "1.3s" },
  { top: "68%", left: "78%", size: "xs", delay: "2s" },
  { top: "74%", left: "42%", size: "sm", delay: "0.4s" },
  { top: "18%", left: "58%", size: "xs", delay: "1.7s" },
  { top: "44%", left: "50%", size: "sm", delay: "2.8s" },
] as const;

export function ComingSoonPage({ dict, endsAtIso }: ComingSoonPageProps) {
  const c = dict.comingSoon;

  return (
    <main className="coming-soon-stage">
      <div aria-hidden="true" className="coming-soon-sky" />
      <div aria-hidden="true" className="coming-soon-nebula coming-soon-nebula--a" />
      <div aria-hidden="true" className="coming-soon-nebula coming-soon-nebula--b" />
      <div aria-hidden="true" className="coming-soon-curtain coming-soon-curtain--left" />
      <div aria-hidden="true" className="coming-soon-curtain coming-soon-curtain--right" />
      <div aria-hidden="true" className="coming-soon-stars">
        {STARS.map((star, index) => (
          <span
            key={index}
            className={`coming-soon-star coming-soon-star--${star.size}`}
            style={{
              top: star.top,
              left: star.left,
              animationDelay: star.delay,
            }}
          >
            ✦
          </span>
        ))}
      </div>

      <div className="coming-soon-content">
        <div className="coming-soon-logo-wrap">
          <div className="coming-soon-logo-ring">
            <Image
              src="/logo.jpg"
              alt={dict.a11y.logoAlt}
              width={176}
              height={176}
              priority
              className="coming-soon-logo"
            />
          </div>
        </div>

        <h1 className="coming-soon-headline">{c.title}</h1>
        <span aria-hidden="true" className="coming-soon-bow" />

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

        <div className="coming-soon-ornament" aria-hidden="true">
          <span>·</span>
          <span>♥</span>
          <span>·</span>
        </div>

        <p className="coming-soon-opens">{c.opensSoon}</p>
      </div>

      <footer className="coming-soon-footer">
        <span aria-hidden="true">✦</span>
        <p>by Didem Keskin</p>
        <span aria-hidden="true">✦</span>
      </footer>
    </main>
  );
}
