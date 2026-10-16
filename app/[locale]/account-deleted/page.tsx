import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.account.deleted.title, robots: { index: false } };
}

export default async function AccountDeletedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <main className="section-pad flex flex-1 items-center justify-center py-16">
      <div className="mx-auto max-w-md text-center">
        <h1 className="page-title">{dict.account.deleted.title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-chocolate-soft">{dict.account.deleted.body}</p>
        <Link href={hrefFor(locale, "")} className="btn-primary btn-inline mt-8">
          {dict.account.deleted.back}
        </Link>
      </div>
    </main>
  );
}
