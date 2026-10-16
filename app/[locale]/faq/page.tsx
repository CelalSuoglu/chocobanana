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
  return { title: dict.faq.title };
}

export default async function FaqPage({
  params,
}: PageProps<"/[locale]/faq">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = await getDictionary(raw);
  const items = [
    { q: dict.faq.q1, a: dict.faq.a1 },
    { q: dict.faq.q2, a: dict.faq.a2 },
    { q: dict.faq.q3, a: dict.faq.a3 },
    { q: dict.faq.q4, a: dict.faq.a4 },
  ];

  return (
    <main className="section-pad mx-auto w-full max-w-2xl flex-1 py-8 md:py-12">
      <Breadcrumbs
        locale={raw}
        label={dict.a11y.breadcrumb}
        items={[
          { label: dict.nav.home, path: "" },
          { label: dict.faq.title },
        ]}
      />
      <h1 className="page-title mt-6">{dict.faq.title}</h1>
      <p className="page-lead">{dict.faq.intro}</p>
      <div className="mt-8 space-y-6">
        {items.map((item) => (
          <section key={item.q}>
            <h2 className="font-serif text-xl text-chocolate">{item.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-chocolate-soft">{item.a}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
