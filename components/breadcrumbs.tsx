import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { hrefFor } from "@/lib/nav";

type Crumb = {
  label: string;
  path?: string;
};

export function Breadcrumbs({
  locale,
  label,
  items,
}: {
  locale: Locale;
  label: string;
  items: Crumb[];
}) {
  return (
    <nav aria-label={label} className="text-sm text-chocolate-soft">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden="true" className="text-pink/70">
                  /
                </span>
              ) : null}
              {last || !item.path ? (
                <span className="text-chocolate" aria-current={last ? "page" : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link href={hrefFor(locale, item.path)} className="hover:text-chocolate">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
