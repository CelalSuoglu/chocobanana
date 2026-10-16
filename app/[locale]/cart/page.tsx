import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CartPageClient } from "@/components/cart-page-client";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getOptionalSession } from "@/lib/auth/session";
import { hrefFor } from "@/lib/nav";
import { paymentsCheckoutEnabled } from "@/lib/stripe/config";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import { readWelcomeDiscount } from "@/lib/welcome/discount";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = await getDictionary(raw);
  return { title: dict.cart.title };
}

export default async function CartPage({
  params,
}: PageProps<"/[locale]/cart">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = await getDictionary(raw);
  const session = await getOptionalSession();
  const member =
    session?.user?.id && session.user.role === "CUSTOMER" ? session.user : null;
  const welcome = member && isDatabaseConfigured()
    ? await readWelcomeDiscount(requirePrisma(), member.id)
    : { eligible: false };

  return (
    <main className="section-pad mx-auto w-full max-w-6xl flex-1 py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-chocolate-soft">
        <Link href={hrefFor(raw, "")} className="hover:text-pink-deep">
          {dict.nav.home}
        </Link>
        <span aria-hidden="true" className="px-2 text-pink/70">
          /
        </span>
        <Link href={hrefFor(raw, "/shop")} className="hover:text-pink-deep">
          {dict.shop.title}
        </Link>
        <span aria-hidden="true" className="px-2 text-pink/70">
          /
        </span>
        <span className="text-chocolate">{dict.cart.title}</span>
      </nav>
      <header className="mt-6 border-b border-line pb-6">
        <h1 className="page-title">
          {dict.cart.title}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-chocolate-soft">
          {dict.cart.intro}
        </p>
      </header>
      <CartPageClient
        locale={raw}
        dict={dict}
        checkoutEnabled={paymentsCheckoutEnabled()}
        signedIn={Boolean(member)}
        welcomeEligible={welcome.eligible}
      />
    </main>
  );
}
