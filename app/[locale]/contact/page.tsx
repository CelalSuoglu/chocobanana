import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { businessContactLines } from "@/lib/legal/business";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/page-hero";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  SITE_EMAIL,
  SITE_INSTAGRAM_HANDLE,
  SITE_INSTAGRAM_URL,
} from "@/lib/site-contact";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = await getDictionary(raw);
  return { title: dict.contact.title };
}

export default async function ContactPage({
  params,
}: PageProps<"/[locale]/contact">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = await getDictionary(raw);

  return (
    <main className="section-pad flex-1 py-12 md:py-16">
      <div className="mx-auto mb-6 max-w-3xl">
        <Breadcrumbs
          locale={raw}
          label={dict.a11y.breadcrumb}
          items={[
            { label: dict.nav.home, path: "" },
            { label: dict.contact.title },
          ]}
        />
      </div>
      <PageHero
        eyebrow={dict.contact.eyebrow}
        title={dict.contact.title}
        intro={dict.contact.intro}
      />

      <div className="mx-auto mt-8 flex max-w-lg flex-col items-center gap-3 text-center text-sm text-chocolate-soft">
        <p>
          <span className="font-serif text-chocolate">{dict.contact.emailLabel}:</span>{" "}
          <a
            href={`mailto:${SITE_EMAIL}`}
            className="text-pink-deep underline-offset-2 hover:underline"
          >
            {SITE_EMAIL}
          </a>
        </p>
        <p>
          <span className="font-serif text-chocolate">
            {dict.contact.instagramLabel}:
          </span>{" "}
          <a
            href={SITE_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-deep underline-offset-2 hover:underline"
          >
            {SITE_INSTAGRAM_HANDLE}
          </a>
        </p>
      </div>

      <p className="mx-auto mt-6 max-w-lg text-center text-xs leading-relaxed text-chocolate-soft">
        {businessContactLines().join(" · ")}
      </p>

      <ContactForm dict={dict.contact} />
    </main>
  );
}
