import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

export type NavItemId =
  | "home"
  | "stickerSheets"
  | "snailMailClub"
  | "shop"
  | "pastLetters"
  | "about"
  | "contact";

export type NavItem = {
  id: NavItemId;
  /** Path after locale, "" for home */
  path: string;
};

/** Primary storefront menu (header). Shop stays at /shop for stationery that is not a sticker sheet. */
export const primaryNavItems: readonly NavItem[] = [
  { id: "stickerSheets", path: "/sticker-sheets" },
  { id: "snailMailClub", path: "/snail-mail-club" },
  { id: "about", path: "/about" },
] as const;

export const navItems: readonly NavItem[] = [
  ...primaryNavItems,
  { id: "pastLetters", path: "/past-letters" },
  { id: "contact", path: "/contact" },
] as const;

export function hrefFor(locale: Locale, path: string): string {
  return path ? `/${locale}${path}` : `/${locale}`;
}

export function labelForNav(dict: Dictionary, id: NavItemId): string {
  switch (id) {
    case "home":
      return dict.nav.home;
    case "shop":
      return dict.nav.shop;
    case "stickerSheets":
      return dict.nav.stickerSheets;
    case "snailMailClub":
      return dict.nav.snailMailClub;
    case "pastLetters":
      return dict.nav.pastLetters;
    case "about":
      return dict.nav.about;
    case "contact":
      return dict.nav.contact;
  }
}
