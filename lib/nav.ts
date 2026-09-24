import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

export type NavItemId =
  | "home"
  | "shop"
  | "mailClub"
  | "pastLetters"
  | "about"
  | "contact";

export type NavItem = {
  id: NavItemId;
  /** Path after locale, "" for home */
  path: string;
};

export const navItems: readonly NavItem[] = [
  { id: "home", path: "" },
  { id: "shop", path: "/shop" },
  { id: "mailClub", path: "/mail-club" },
  { id: "pastLetters", path: "/past-letters" },
  { id: "about", path: "/about" },
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
    case "mailClub":
      return dict.nav.mailClub;
    case "pastLetters":
      return dict.nav.pastLetters;
    case "about":
      return dict.nav.about;
    case "contact":
      return dict.nav.contact;
  }
}
