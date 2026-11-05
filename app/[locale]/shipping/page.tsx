import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = await getDictionary(raw);
  return { title: dict.shipping.title };
}

export default async function ShippingPage({
  params,
}: PageProps<"/[locale]/shipping">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = await getDictionary(raw);

  return (
    <main className="section-pad mx-auto w-full max-w-2xl flex-1 py-8 md:py-12">
      <Breadcrumbs
        locale={raw}
        label={dict.a11y.breadcrumb}
        items={[
          { label: dict.nav.home, path: "" },
          { label: dict.shipping.title },
        ]}
      />
      <h1 className="page-title mt-6">{dict.shipping.title}</h1>
      <p className="page-lead">{dict.shipping.intro}</p>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-chocolate-soft">
        <p>{dict.shipping.postage}</p>
        <p>{dict.shipping.countries}</p>
        <p>{dict.shipping.stickers}</p>
        <p>{dict.shipping.timing}</p>
        <p>{dict.shipping.duties}</p>
      </div>
    </main>
  );
}
