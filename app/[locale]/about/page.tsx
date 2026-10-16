import type { Metadata } from "next";
import Image from "next/image";
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
  return { title: dict.about.title };
}

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/about">) {
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
          { label: dict.about.title },
        ]}
      />
      <Image
        src="/logo.jpg"
        alt={dict.a11y.logoAlt}
        width={96}
        height={96}
        className="mt-6 h-20 w-20 rounded-full object-cover ring-1 ring-pink/40"
      />
      <h1 className="page-title mt-5">{dict.about.title}</h1>
      <p className="page-lead">{dict.about.intro}</p>
      <div className="mt-8 space-y-4 text-base leading-relaxed text-chocolate-soft">
        <p>{dict.about.p1}</p>
        <p>{dict.about.p2}</p>
        {dict.about.logoNote ? (
          <p className="text-sm">{dict.about.logoNote}</p>
        ) : null}
      </div>
    </main>
  );
}
