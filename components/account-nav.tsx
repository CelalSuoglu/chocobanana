"use client";

import Link from "next/link";
import { logoutCustomerAction } from "@/lib/auth/actions";
import type { Locale } from "@/lib/i18n/config";
import { hrefFor } from "@/lib/nav";

type AccountNavProps = {
  locale: Locale;
  signedIn: boolean;
  accountLabel: string;
  signInLabel: string;
  signUpLabel: string;
  signOutLabel: string;
  accountIconLabel: string;
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
  signOutLabel,
  accountIconLabel,
}: AccountNavProps) {
  const iconHref = signedIn
    ? hrefFor(locale, "/account")
    : hrefFor(locale, "/login");

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Link
        href={iconHref}
        className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-pink/45 bg-paper/90 text-chocolate transition-colors hover:border-pink-deep hover:text-pink-deep"
        aria-label={accountIconLabel}
      >
        <PersonIcon />
      </Link>

      {signedIn ? (
        <>
          <Link
            href={hrefFor(locale, "/account")}
            className="inline-flex min-h-10 max-w-[7.5rem] items-center truncate rounded-full px-2 font-serif text-xs tracking-[0.06em] text-chocolate-soft transition-colors hover:text-pink-deep sm:max-w-none sm:px-3 sm:text-sm sm:tracking-[0.08em]"
          >
            {accountLabel}
          </Link>
          <form action={logoutCustomerAction} className="hidden md:block">
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="inline-flex min-h-10 items-center rounded-full border border-pink/45 bg-paper/90 px-3 font-serif text-sm tracking-[0.08em] text-chocolate transition-colors hover:border-pink-deep hover:text-pink-deep"
            >
              {signOutLabel}
            </button>
          </form>
        </>
      ) : (
        <>
          <Link
            href={hrefFor(locale, "/login")}
            className="inline-flex min-h-10 items-center rounded-full px-1.5 font-serif text-xs tracking-[0.06em] text-chocolate-soft transition-colors hover:text-pink-deep sm:px-3 sm:text-sm sm:tracking-[0.08em]"
          >
            {signInLabel}
          </Link>
          <Link
            href={hrefFor(locale, "/register")}
            className="inline-flex min-h-10 items-center rounded-full border border-pink/45 bg-paper/90 px-2 font-serif text-xs tracking-[0.06em] text-chocolate transition-colors hover:border-pink-deep hover:text-pink-deep sm:px-3 sm:text-sm sm:tracking-[0.08em]"
          >
            {signUpLabel}
          </Link>
        </>
      )}
    </div>
  );
}
