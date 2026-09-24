import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor, labelForNav, navItems } from "@/lib/nav";

type SiteFooterProps = {
  locale: Locale;
  dict: Dictionary;
};

export function SiteFooter({ locale, dict }: SiteFooterProps) {
  const links = navItems.map((item) => ({
    href: hrefFor(locale, item.path),
    label: labelForNav(dict, item.id),
  }));

  return (
    <footer className="border-t border-pink/30 bg-cream-deep/50">
      <div className="section-pad mx-auto flex max-w-4xl flex-col items-center gap-4 py-10 text-center md:py-12">
        <p className="font-serif text-xl tracking-[0.12em] text-chocolate">
          Chocobanana
        </p>
        <p className="font-script text-xl text-pink-deep">{dict.footer.tagline}</p>
        <nav
          aria-label="Footer"
          className="flex flex-wrap justify-center gap-x-5 gap-y-2 font-serif text-sm tracking-[0.12em] text-chocolate-soft"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-pink-deep"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="mt-2 text-xs tracking-wide text-chocolate-soft/80">
          {dict.footer.credit}
        </p>
        <p className="mt-1 font-script text-sm text-chocolate-soft/70 md:text-[0.95rem]">
          by Didem Keskin
        </p>
      </div>
    </footer>
  );
}
