import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal-document";
import { isLocale } from "@/lib/i18n/config";
import { getPrivacyPolicy } from "@/lib/legal/privacy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getPrivacyPolicy(locale).title };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const policy = getPrivacyPolicy(locale);
  return (
    <LegalDocument
      path="/privacy"
      lang={policy.lang}
      title={policy.title}
      updated={policy.updated}
      intro={policy.intro}
      sections={policy.sections}
    />
  );
}
