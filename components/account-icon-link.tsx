"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { hrefFor } from "@/lib/nav";

type AccountIconLinkProps = {
  locale: Locale;
  label: string;
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

export function AccountIconLink({ locale, label }: AccountIconLinkProps) {
  return (
    <Link
      href={hrefFor(locale, "/account")}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-pink/45 bg-paper/90 text-chocolate transition-colors hover:border-pink-deep hover:text-pink-deep"
      aria-label={label}
    >
      <PersonIcon />
    </Link>
  );
}
