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
    <main className="section-pad mx-auto w-full max-w-5xl flex-1 py-8 md:py-12">
      <Breadcrumbs
        locale={raw}
        label={dict.a11y.breadcrumb}
        items={[
          { label: dict.nav.home, path: "" },
          { label: dict.about.title },
        ]}
      />
      <div className="mt-8 grid items-start gap-12 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-16">
        <div>
          <h1 className="page-title">{dict.about.title}</h1>
          <p className="page-lead">{dict.about.intro}</p>
          <p className="body-copy mt-5 max-w-xl">{dict.about.p1}</p>
          {dict.about.logoNote ? (
            <p className="mt-4 text-sm text-chocolate-soft">{dict.about.logoNote}</p>
          ) : null}
        </div>
        <figure className="polaroid mx-auto w-full max-w-sm md:mt-4">
          <Image
            src="/winnie.jpg"
            alt={dict.home.winnieAlt}
            width={1100}
            height={1100}
            priority
            sizes="(min-width: 768px) 24rem, 90vw"
            className="aspect-square w-full object-cover"
          />
          <figcaption className="polaroid-note">{dict.about.p2}</figcaption>
        </figure>
      </div>
    </main>
  );
}
