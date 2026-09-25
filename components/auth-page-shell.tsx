import Image from "next/image";
import type { ReactNode } from "react";
import { Star } from "@/components/star";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  intro: string;
  logoAlt: string;
  notice?: string;
  children: ReactNode;
};

/** Shared branded frame for customer sign-in / register pages. */
export function AuthPageShell({
  eyebrow,
  title,
  intro,
  logoAlt,
  notice,
  children,
}: AuthPageShellProps) {
  return (
    <main className="section-pad relative flex-1 overflow-hidden pb-16 pt-10 md:pb-20 md:pt-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
      >
        <div className="absolute -start-10 top-16 h-48 w-48 rounded-full bg-pink/30 blur-3xl md:h-64 md:w-64" />
        <div className="absolute -end-8 top-40 h-56 w-56 rounded-full bg-gold/20 blur-3xl md:h-72 md:w-72" />
      </div>

      <div className="relative z-10 mx-auto max-w-xl">
        <div className="text-center">
          <div className="relative mx-auto inline-block">
            <Star
              className="absolute -start-6 -top-1 text-sm text-gold"
              style={{ animationDelay: "0.35s" }}
            />
            <Star
              className="absolute -end-5 top-8 text-xs text-pink-deep"
              style={{ animationDelay: "1.1s" }}
            />
            <div className="overflow-hidden rounded-full bg-paper/70 p-2 shadow-[0_14px_40px_rgba(60,42,34,0.1)] ring-1 ring-pink/45">
              <Image
                src="/logo.jpg"
                alt={logoAlt}
                width={112}
                height={112}
                priority
                className="h-20 w-20 rounded-full object-cover sm:h-24 sm:w-24"
              />
            </div>
          </div>

          <p className="mt-5 font-script text-2xl text-pink-deep md:text-3xl">
            {eyebrow}
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-chocolate md:text-4xl">
            {title}
          </h1>
          <div className="divider-ornament mt-4">
            <Star className="text-sm" />
          </div>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-chocolate-soft md:text-base">
            {intro}
          </p>
        </div>

        {notice ? (
          <p
            className="mt-6 rounded-2xl border border-gold/50 bg-gold-soft/30 px-4 py-3 text-center text-sm text-chocolate"
            role="status"
          >
            {notice}
          </p>
        ) : null}

        <div className="mt-8 rounded-[1.75rem] border border-pink/35 bg-paper/90 px-5 py-7 shadow-[0_18px_50px_rgba(60,42,34,0.08)] sm:px-8 sm:py-8">
          {children}
        </div>
      </div>
    </main>
  );
}
