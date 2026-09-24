import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Star } from "@/components/star";
import {
  baseCurrency,
  currencyCookieName,
  isCurrencyCode,
  type CurrencyCode,
} from "@/lib/currency/config";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { isComingSoonEnabled } from "@/lib/site-access";

type SiteShellProps = {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
};

export async function SiteShell({ locale, dict, children }: SiteShellProps) {
  if (isComingSoonEnabled()) {
    return <>{children}</>;
  }

  const cookieStore = await cookies();
  const rawCurrency = cookieStore.get(currencyCookieName)?.value;
  const currency: CurrencyCode =
    rawCurrency && isCurrencyCode(rawCurrency) ? rawCurrency : baseCurrency;

  return (
    <CartProvider>
      <div className="relative flex min-h-full flex-col overflow-x-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-24 z-0 flex justify-between px-6 md:px-16">
          <Star
            className="text-lg md:text-xl"
            style={{ animationDelay: "0.2s" }}
          />
          <Star
            className="mt-16 text-sm md:text-base"
            style={{ animationDelay: "1.1s" }}
          />
        </div>
        <SiteHeader locale={locale} currency={currency} dict={dict} />
        <div className="relative z-10 flex flex-1 flex-col">{children}</div>
        <SiteFooter locale={locale} dict={dict} />
      </div>
    </CartProvider>
  );
}
