import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";
import { BUSINESS } from "@/lib/legal/business";
import {
  SITE_EMAIL,
  SITE_INSTAGRAM_HANDLE,
  SITE_INSTAGRAM_URL,
} from "@/lib/site-contact";

type SiteFooterProps = {
  locale: Locale;
  dict: Dictionary;
};

export function SiteFooter({ locale, dict }: SiteFooterProps) {
  const links = [
    { href: hrefFor(locale, "/about"), label: dict.nav.about },
    { href: hrefFor(locale, "/contact"), label: dict.nav.contact },
    { href: hrefFor(locale, "/faq"), label: dict.footer.faq },
    { href: hrefFor(locale, "/shipping"), label: dict.footer.shipping },
    { href: hrefFor(locale, "/terms"), label: dict.footer.terms },
    { href: hrefFor(locale, "/privacy"), label: dict.footer.privacy },
  ];

  return (
    <footer className="border-t border-line bg-paper">
      <div className="section-pad mx-auto grid max-w-5xl gap-6 py-10 text-sm text-chocolate-soft md:grid-cols-3 md:gap-10 md:py-14">
        <div>
          <a href={hrefFor(locale, "")} className="inline-flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover ring-1 ring-line"
            />
            <span className="font-script text-2xl text-chocolate">Chocobanana</span>
          </a>
          <p className="mt-3 max-w-xs leading-relaxed">{dict.footer.credit}</p>
          <p className="mt-1">by Didem Keskin</p>
        </div>

        <nav aria-label={dict.footer.linksLabel}>
          <ul className="flex flex-wrap gap-x-5 md:flex-col md:gap-x-0">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="inline-flex min-h-11 items-center hover:text-chocolate">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col border-t border-line pt-4 md:border-0 md:pt-0">
          <a
            href={SITE_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center hover:text-chocolate"
          >
            {dict.footer.instagram}: {SITE_INSTAGRAM_HANDLE}
          </a>
          <a href={`mailto:${SITE_EMAIL}`} className="inline-flex min-h-11 items-center break-all hover:text-chocolate">
            {SITE_EMAIL}
          </a>
          <p className="mt-2 text-xs leading-relaxed">
            {BUSINESS.tradeName} · {BUSINESS.sellerName}
            {BUSINESS.mailingAddress ? <><br />{BUSINESS.mailingAddress}</> : null}
            {BUSINESS.phone ? <><br />{BUSINESS.phone}</> : null}
          </p>
          <a
            href={hrefFor(locale, "/withdraw")}
            className="mt-4 inline-flex min-h-11 w-fit items-center rounded-full border border-chocolate px-4 text-sm text-chocolate hover:bg-chocolate hover:text-cream"
          >
            {dict.footer.withdraw}
          </a>
        </div>
      </div>
    </footer>
  );
}
