"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { hrefFor } from "@/lib/nav";

type AccountNavProps = {
  locale: Locale;
  signedIn: boolean;
  accountLabel: string;
  signInLabel: string;
  signUpLabel: string;
};

function PersonIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <circle cx="12" cy="8" r="3.25" />
      <path
        d="M5.5 19.5c1.6-3.2 4-4.75 6.5-4.75s4.9 1.55 6.5 4.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Customer auth entry points only — never links to /owner. */
export function AccountNav({
  locale,
  signedIn,
  accountLabel,
  signInLabel,
  signUpLabel,
}: AccountNavProps) {
  if (signedIn) {
    return (
      <Link
        href={hrefFor(locale, "/account")}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-pink/45 bg-paper/90 text-chocolate transition-colors hover:border-pink-deep hover:text-pink-deep"
        aria-label={accountLabel}
      >
        <PersonIcon />
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Link
        href={hrefFor(locale, "/login")}
        className="inline-flex min-h-10 items-center rounded-full px-2.5 font-serif text-sm tracking-[0.08em] text-chocolate-soft transition-colors hover:text-pink-deep sm:px-3"
      >
        {signInLabel}
      </Link>
      <Link
        href={hrefFor(locale, "/register")}
        className="inline-flex min-h-10 items-center rounded-full border border-pink/45 bg-paper/90 px-3 font-serif text-sm tracking-[0.08em] text-chocolate transition-colors hover:border-pink-deep hover:text-pink-deep"
      >
        {signUpLabel}
      </Link>
    </div>
  );
}
