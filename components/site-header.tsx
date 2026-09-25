"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { AccountNav } from "@/components/account-nav";
import { CartIconLink } from "@/components/cart-icon-link";
import { LocaleCurrencySwitcher } from "@/components/locale-currency-switcher";
import { logoutCustomerAction } from "@/lib/auth/actions";
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
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <Link
            href={hrefFor(locale, "")}
            className="shrink-0 font-serif text-lg tracking-[0.08em] text-chocolate transition-colors hover:text-pink-deep md:text-xl"
          >
            Chocobanana
          </Link>

          <nav
            aria-label="Primary"
            className="hidden min-w-0 flex-1 items-center justify-center gap-x-4 overflow-x-auto whitespace-nowrap font-serif text-sm tracking-[0.1em] text-chocolate-soft md:flex lg:gap-x-5 lg:text-[0.95rem]"
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

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="hidden lg:block">
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
            </div>
            <CartIconLink locale={locale} label={dict.cart.openCart} />
            <AccountNav
              locale={locale}
              signedIn={signedIn}
              accountLabel={dict.nav.account}
              signInLabel={dict.auth.signIn}
              signUpLabel={dict.auth.signUp}
              signOutLabel={dict.account.signOut}
              accountIconLabel={dict.a11y.accountMenu}
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
            <li>
              <Link
                href={hrefFor(locale, "/cart")}
                className="block rounded-2xl px-4 py-3 font-serif text-base tracking-[0.08em] text-chocolate-soft hover:bg-paper/80 hover:text-pink-deep"
                onClick={() => setOpen(false)}
              >
                {dict.cart.title}
              </Link>
            </li>
            <li className="mt-2 border-t border-pink/20 pt-2">
              {signedIn ? (
                <>
                  <Link
                    href={hrefFor(locale, "/account")}
                    className="block rounded-2xl px-4 py-3 font-serif text-base tracking-[0.08em] text-chocolate-soft hover:bg-paper/80 hover:text-pink-deep"
                    onClick={() => setOpen(false)}
                  >
                    {dict.nav.account}
                  </Link>
                  <form action={logoutCustomerAction} className="px-2 pb-1">
                    <input type="hidden" name="locale" value={locale} />
                    <button
                      type="submit"
                      className="mt-1 w-full rounded-2xl border border-pink/40 bg-paper/90 px-4 py-3 text-start font-serif text-base tracking-[0.08em] text-chocolate hover:border-pink-deep hover:text-pink-deep"
                    >
                      {dict.account.signOut}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href={hrefFor(locale, "/login")}
                    className="block rounded-2xl px-4 py-3 font-serif text-base tracking-[0.08em] text-chocolate-soft hover:bg-paper/80 hover:text-pink-deep"
                    onClick={() => setOpen(false)}
                  >
                    {dict.auth.signIn}
                  </Link>
                  <Link
                    href={hrefFor(locale, "/register")}
                    className="mt-1 block rounded-2xl bg-pink-soft/50 px-4 py-3 font-serif text-base tracking-[0.08em] text-pink-deep"
                    onClick={() => setOpen(false)}
                  >
                    {dict.auth.signUp}
                  </Link>
                </>
              )}
            </li>
            <li className="border-t border-pink/20 pt-3 lg:hidden">
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
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
