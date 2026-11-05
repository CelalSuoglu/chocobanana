import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal-document";
import { isLocale } from "@/lib/i18n/config";
import { getRefundPolicy } from "@/lib/legal/policies";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getRefundPolicy(locale).title };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const doc = getRefundPolicy(locale);
  return (
    <LegalDocument
      path="/refund-policy"
      lang={doc.lang}
      title={doc.title}
      updated={doc.updated}
      intro={doc.intro}
      sections={doc.sections}
    />
  );
}
