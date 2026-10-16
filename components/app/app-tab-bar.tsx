"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useCart } from "@/components/cart-provider";
import type { Locale } from "@/lib/i18n/config";
import { hrefFor } from "@/lib/nav";

type TabId = "home" | "stickers" | "club" | "cart" | "account";

type AppTabBarProps = {
  locale: Locale;
  signedIn: boolean;
  labels: Record<TabId, string> & { navigation: string; cartCount: string };
};

const icon = {
  className: "h-6 w-6",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
} as const;

const icons: Record<TabId, ReactNode> = {
  home: (
    <svg {...icon}>
      <path d="M4 11.5 12 5l8 6.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 10v9h11v-9" strokeLinejoin="round" />
    </svg>
  ),
  stickers: (
    <svg {...icon}>
      <path
        d="m12 4 2.3 4.8 5.2.7-3.8 3.6.9 5.2L12 15.8l-4.6 2.5.9-5.2-3.8-3.6 5.2-.7L12 4Z"
        strokeLinejoin="round"
      />
    </svg>
  ),
  club: (
    <svg {...icon}>
      <rect x="3.5" y="6" width="17" height="12" rx="1.5" />
      <path d="m4 7 8 6 8-6" strokeLinejoin="round" />
    </svg>
  ),
  cart: (
    <svg {...icon}>
      <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" strokeLinecap="round" />
    </svg>
  ),
  account: (
    <svg {...icon}>
      <circle cx="12" cy="9" r="3.5" />
      <path d="M5 19.5c1.4-3.2 4-4.5 7-4.5s5.6 1.3 7 4.5" strokeLinecap="round" />
    </svg>
  ),
};

/** Bottom tab navigation for the native app (never rendered on the website). */
export function AppTabBar({ locale, signedIn, labels }: AppTabBarProps) {
  const pathname = usePathname() || `/${locale}`;
  const { itemCount, ready } = useCart();
  const count = ready ? itemCount : 0;

  const accountPaths = ["/account", "/login", "/sign-in", "/register", "/sign-up", "/forgot-password", "/reset-password", "/verify-email"];

  const tabs: { id: TabId; href: string; match: string[] }[] = [
    { id: "home", href: hrefFor(locale, ""), match: [""] },
    { id: "stickers", href: hrefFor(locale, "/sticker-sheets"), match: ["/sticker-sheets", "/shop"] },
    { id: "club", href: hrefFor(locale, "/snail-mail-club"), match: ["/snail-mail-club", "/mail-club", "/past-letters"] },
    { id: "cart", href: hrefFor(locale, "/cart"), match: ["/cart", "/checkout"] },
    {
      id: "account",
      href: hrefFor(locale, signedIn ? "/account" : "/login"),
      match: accountPaths,
    },
  ];

  const isActive = (match: string[]) =>
    match.some((path) => {
      const target = hrefFor(locale, path);
      if (!path) return pathname === target || pathname === `${target}/`;
      return pathname === target || pathname.startsWith(`${target}/`);
    });

  return (
    <>
      <div aria-hidden="true" className="app-tabbar-spacer" />
      <nav aria-label={labels.navigation} className="app-tabbar">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {tabs.map((tab) => {
            const active = isActive(tab.match);
            const badge = tab.id === "cart" && count > 0;
            return (
              <li key={tab.id}>
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  aria-label={badge ? labels.cartCount.replace("{count}", String(count)) : undefined}
                  className={`app-tab ${active ? "is-active" : ""}`}
                >
                  <span className="relative">
                    {icons[tab.id]}
                    {badge ? (
                      <span className="absolute -end-2 -top-1.5 flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-pink-deep px-1 font-serif text-[0.62rem] leading-none text-cream">
                        {count > 99 ? "99+" : count}
                      </span>
                    ) : null}
                  </span>
                  <span className="app-tab-label">{labels[tab.id]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
