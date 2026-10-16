import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";
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
    { href: hrefFor(locale, "/contact"), label: dict.nav.contact },
    { href: hrefFor(locale, "/faq"), label: dict.footer.faq },
    { href: hrefFor(locale, "/shipping"), label: dict.footer.shipping },
    { href: hrefFor(locale, "/privacy"), label: dict.footer.privacy },
  ];

  return (
    <footer className="border-t border-line bg-paper">
      <div className="section-pad mx-auto flex max-w-3xl flex-col items-center gap-4 py-10 text-center text-sm text-chocolate-soft">
        <nav aria-label={dict.footer.linksLabel} className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="min-h-11 inline-flex items-center hover:text-chocolate">
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href={SITE_INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-chocolate"
        >
          {dict.footer.instagram}: {SITE_INSTAGRAM_HANDLE}
        </a>
        <a href={`mailto:${SITE_EMAIL}`} className="hover:text-chocolate">
          {SITE_EMAIL}
        </a>
        <p className="text-chocolate">by Didem Keskin</p>
      </div>
    </footer>
  );
}
