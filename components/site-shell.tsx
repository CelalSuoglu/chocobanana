import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getOptionalSession } from "@/lib/auth/session";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { isComingSoonGateActive } from "@/lib/site-access-server";

type SiteShellProps = {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
};

export async function SiteShell({ locale, dict, children }: SiteShellProps) {
  // Countdown page keeps its own full-bleed layout (no shop chrome).
  if (await isComingSoonGateActive()) {
    return <>{children}</>;
  }

  const session = await getOptionalSession();
  const signedIn = Boolean(session?.user?.id);
  const userName = session?.user?.name ?? null;

  return (
    <CartProvider>
      <div className="relative flex min-h-full flex-col overflow-x-hidden">
        <SiteHeader
          locale={locale}
          dict={dict}
          signedIn={signedIn}
          userName={userName}
        />
        <div className="relative z-10 flex flex-1 flex-col">{children}</div>
        <SiteFooter locale={locale} dict={dict} />
      </div>
    </CartProvider>
  );
}
