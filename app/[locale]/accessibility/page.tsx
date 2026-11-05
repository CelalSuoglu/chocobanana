import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal-document";
import { isLocale } from "@/lib/i18n/config";
import { getAccessibilityStatement } from "@/lib/legal/policies";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getAccessibilityStatement(locale).title };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const doc = getAccessibilityStatement(locale);
  return (
    <LegalDocument
      path="/accessibility"
      lang={doc.lang}
      title={doc.title}
      updated={doc.updated}
      intro={doc.intro}
      sections={doc.sections}
    />
  );
}
