import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

      <ContactForm dict={dict.contact} />
    </main>
  );
}
