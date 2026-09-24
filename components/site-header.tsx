"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { AccountNav } from "@/components/account-nav";
import { CartIconLink } from "@/components/cart-icon-link";
import { LocaleCurrencySwitcher } from "@/components/locale-currency-switcher";
import type { CurrencyCode } from "@/lib/currency/config";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor, labelForNav, navItems } from "@/lib/nav";

type SiteHeaderProps = {
  locale: Locale;
  currency: CurrencyCode;
  dict: Dictionary;
  signedIn: boolean;
};

function pathMatches(pathname: string, locale: Locale, itemPath: string) {
  const target = hrefFor(locale, itemPath);
  if (!itemPath) {
    return pathname === target || pathname === `/${locale}/`;
  }
  return pathname === target || pathname.startsWith(`${target}/`);
}

export function SiteHeader({ locale, currency, dict, signedIn }: SiteHeaderProps) {
  const pathname = usePathname() || `/${locale}`;
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = navItems.map((item) => ({
    ...item,
    href: hrefFor(locale, item.path),
    label: labelForNav(dict, item.id),
    active: pathMatches(pathname, locale, item.path),
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-pink/30 bg-cream/90 backdrop-blur-md">
      <div className="section-pad mx-auto max-w-5xl py-3 md:py-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={hrefFor(locale, "")}
            className="font-serif text-lg tracking-[0.08em] text-chocolate transition-colors hover:text-pink-deep md:text-xl"
          >
            Chocobanana
          </Link>

          <div className="flex items-center gap-2">
            <LocaleCurrencySwitcher
              locale={locale}
              currency={currency}
              labels={{
                language: dict.nav.language,
                currency: dict.nav.currency,
                selectLanguage: dict.a11y.selectLanguage,
                selectCurrency: dict.a11y.selectCurrency,
              }}
            />
            <CartIconLink locale={locale} label={dict.cart.openCart} />
            <AccountNav
              locale={locale}
              signedIn={signedIn}
              accountLabel={dict.nav.account}
              signInLabel={dict.auth.signIn}
              signUpLabel={dict.auth.signUp}
              signOutLabel={dict.account.signOut}
            />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-pink/45 bg-paper/90 text-chocolate md:hidden"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={open ? dict.nav.closeMenu : dict.nav.openMenu}
              onClick={() => setOpen((value) => !value)}
            >
              <span aria-hidden="true" className="font-serif text-lg leading-none">
                {open ? "×" : "☰"}
              </span>
            </button>
          </div>
        </div>

        <nav
          aria-label="Primary"
          className="mt-3 hidden flex-wrap justify-center gap-x-6 gap-y-2 border-t border-pink/20 pt-3 font-serif text-[0.95rem] tracking-[0.12em] text-chocolate-soft md:flex md:text-base"
        >
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={`transition-colors hover:text-pink-deep ${
                link.active ? "text-pink-deep" : ""
              }`}
              aria-current={link.active ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <nav
          id={panelId}
          aria-label="Mobile"
          className={`mt-3 border-t border-pink/20 pt-3 md:hidden ${open ? "block" : "hidden"}`}
        >
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.id}>
                <Link
                  href={link.href}
                  className={`block rounded-2xl px-4 py-3 font-serif text-base tracking-[0.08em] transition-colors ${
                    link.active
                      ? "bg-pink-soft/50 text-pink-deep"
                      : "text-chocolate-soft hover:bg-paper/80 hover:text-pink-deep"
                  }`}
                  aria-current={link.active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
