import type { ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { CartProvider } from "@/components/cart-provider";
import { ToastProvider } from "@/components/toast-provider";
import { MailingListPopup } from "@/components/mailing-list-popup";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getOptionalSession } from "@/lib/auth/session";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { getNativeAppContext } from "@/lib/native/app-context";
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
  // Native iOS/Android shell only; the website renders exactly as before.
  const app = await getNativeAppContext();

  return (
    <CartProvider>
      <ToastProvider label={dict.a11y.notifications}>
      <div className="relative flex min-h-full flex-col overflow-x-hidden">
        <SiteHeader
          locale={locale}
          dict={dict}
          signedIn={signedIn}
          userName={userName}
        />
        <div className="relative z-10 flex flex-1 flex-col">
          {app.isApp ? (
            <AppShell
              locale={locale}
              signedIn={signedIn}
              pushCapable={app.pushCapable}
              labels={{
                offline: dict.app.offline,
                backOnline: dict.app.backOnline,
                loading: dict.app.loading,
              }}
            >
              {children}
            </AppShell>
          ) : (
            children
          )}
        </div>
        <SiteFooter locale={locale} dict={dict} />
        {app.isApp ? (
          <AppTabBar
            locale={locale}
            signedIn={signedIn}
            labels={{ ...dict.app.tabs, cartCount: dict.cart.bagCount }}
          />
        ) : null}
        {/* The app opens straight into the shop; the newsletter stays on sign-up and the website. */}
        {app.isApp ? null : (
          <MailingListPopup
            locale={locale}
            signedIn={signedIn}
            labels={dict.mailing}
          />
        )}
      </div>
      </ToastProvider>
    </CartProvider>
  );
}
