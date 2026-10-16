import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CheckoutForm, type CheckoutProfile } from "@/components/checkout-form";
import { getOptionalSession } from "@/lib/auth/session";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { readWelcomeDiscount } from "@/lib/welcome/discount";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = await getDictionary(raw);
  return { title: dict.checkout.shipTitle };
}

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ product?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const { product } = await searchParams;
  const dict = await getDictionary(raw);
  const session = await getOptionalSession();
  const member =
    session?.user?.id && session.user.role === "CUSTOMER" ? session.user : null;

  let profile: CheckoutProfile | null = null;
  if (member && isDatabaseConfigured()) {
    const user = await requirePrisma().user.findUnique({
      where: { id: member.id },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        region: true,
        postalCode: true,
        country: true,
      },
    });
    if (user) {
      profile = {
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email,
        phone: user.phone ?? "",
        line1: user.addressLine1 ?? "",
        line2: user.addressLine2 ?? "",
        city: user.city ?? "",
        region: user.region ?? "",
        postalCode: user.postalCode ?? "",
        country: (user.country ?? "").toUpperCase(),
      };
    }
  }

  const welcome = member && isDatabaseConfigured()
    ? await readWelcomeDiscount(requirePrisma(), member.id)
    : { eligible: false };

  const labels = dict.checkout;

  return (
    <main className="section-pad mx-auto w-full max-w-5xl flex-1 py-8 md:py-12">
      <Breadcrumbs
        locale={raw}
        label={dict.a11y.breadcrumb}
        items={[
          { label: dict.nav.home, path: "" },
          { label: dict.cart.title, path: "/cart" },
          { label: labels.shipTitle },
        ]}
      />
      <h1 className="page-title mt-6">{labels.shipTitle}</h1>
      <p className="mt-2 max-w-xl text-sm text-chocolate-soft">{labels.shipIntro}</p>
      <CheckoutForm
        locale={raw}
        signedIn={Boolean(member)}
        welcomeEligible={welcome.eligible}
        profile={profile}
        productId={product?.trim() || undefined}
        labels={{
          shipTitle: labels.shipTitle,
          shipIntro: labels.shipIntro,
          firstName: labels.firstName,
          lastName: labels.lastName,
          email: labels.email,
          country: labels.country,
          address: labels.address,
          apartment: labels.apartment,
          city: labels.city,
          region: labels.region,
          postal: labels.postal,
          phone: labels.phone,
          continuePayment: labels.continuePayment,
          pending: labels.pending,
          summary: labels.summary,
          deliveryRegion: labels.deliveryRegion,
          regionCanada: labels.regionCanada,
          regionUsa: labels.regionUsa,
          regionInternational: labels.regionInternational,
          postageIncluded: labels.postageIncluded,
          shippingLine: labels.shippingLine,
          total: labels.total,
          countryMismatch: labels.countryMismatch,
          addressInvalid: labels.addressInvalid,
          empty: labels.checkoutEmpty,
          continueShopping: dict.cart.exploreClub,
          error: labels.error,
          welcomeDiscount: labels.welcomeDiscount,
          rewardDiscount: dict.cart.rewardDiscount,
          joinTitle: labels.joinTitle,
          joinNote: labels.joinNote,
          createAccount: dict.auth.signUp,
          stepDetails: labels.stepDetails,
          stepPayment: labels.stepPayment,
          stepConfirmation: labels.stepConfirmation,
          stepsLabel: labels.stepsLabel,
          fieldRequired: labels.fieldRequired,
          emailInvalid: labels.emailInvalid,
          postalInvalid: labels.postalInvalid,
          phoneInvalid: labels.phoneInvalid,
          regionInvalid: labels.regionInvalid,
        }}
      />
    </main>
  );
}
