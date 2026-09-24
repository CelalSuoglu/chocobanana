"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import type { Locale } from "@/lib/i18n/config";
import { hrefFor } from "@/lib/nav";

type CartIconLinkProps = {
  locale: Locale;
  label: string;
};

function BagIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" strokeLinecap="round" />
    </svg>
  );
}

export function CartIconLink({ locale, label }: CartIconLinkProps) {
  const { itemCount, ready } = useCart();
  const count = ready ? itemCount : 0;

  return (
    <Link
      href={hrefFor(locale, "/cart")}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-pink/45 bg-paper/90 text-chocolate transition-colors hover:border-pink-deep hover:text-pink-deep"
      aria-label={label}
    >
      <BagIcon />
      {count > 0 ? (
        <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-deep px-1 font-serif text-[0.65rem] leading-none text-cream">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
