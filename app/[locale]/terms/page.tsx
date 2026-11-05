import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal-document";
import { isLocale } from "@/lib/i18n/config";
import { getTerms } from "@/lib/legal/terms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getTerms(locale).title };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const terms = getTerms(locale);
  return (
    <LegalDocument
      path="/terms"
      lang={terms.lang}
      title={terms.title}
      updated={terms.updated}
      intro={terms.intro}
      sections={terms.sections}
    />
  );
}
