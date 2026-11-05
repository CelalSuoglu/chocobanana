import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { WithdrawForm } from "@/components/withdraw-form";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { BUSINESS } from "@/lib/legal/business";
import { hrefFor } from "@/lib/nav";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = await getDictionary(raw);
  return { title: dict.withdraw.title };
}

export default async function WithdrawPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = await getDictionary(raw);

  return (
    <main className="section-pad mx-auto w-full max-w-xl flex-1 py-8 md:py-12">
      <Breadcrumbs
        locale={raw}
        label={dict.a11y.breadcrumb}
        items={[
          { label: dict.nav.home, path: "" },
          { label: dict.withdraw.title },
        ]}
      />
      <h1 className="page-title mt-6">{dict.withdraw.title}</h1>
      <p className="page-lead">{dict.withdraw.intro}</p>
      <p className="body-copy mt-3 text-sm">
        <Link href={hrefFor(raw, "/terms")} className="underline underline-offset-2">
          {dict.footer.terms}
        </Link>
      </p>
      <WithdrawForm dict={dict.withdraw} contactEmail={BUSINESS.email} />
    </main>
  );
}
