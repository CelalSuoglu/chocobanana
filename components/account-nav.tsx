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
};

/** Customer auth entry points only — never links to /owner. */
export function AccountNav({
  locale,
  signedIn,
  accountLabel,
  signInLabel,
  signUpLabel,
  signOutLabel,
}: AccountNavProps) {
  if (signedIn) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <Link
          href={hrefFor(locale, "/account")}
          className="inline-flex min-h-10 items-center rounded-full px-2.5 font-serif text-sm tracking-[0.08em] text-chocolate-soft transition-colors hover:text-pink-deep sm:px-3"
        >
          {accountLabel}
        </Link>
        <form action={logoutCustomerAction}>
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            className="inline-flex min-h-10 items-center rounded-full border border-pink/45 bg-paper/90 px-3 font-serif text-sm tracking-[0.08em] text-chocolate transition-colors hover:border-pink-deep hover:text-pink-deep"
          >
            {signOutLabel}
          </button>
        </form>
      </div>
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
