import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  locales,
} from "./lib/i18n/config";
import { resolvePreferredLocale } from "./lib/i18n/resolve-locale";

const LOCALE_MAX_AGE = 60 * 60 * 24 * 365;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameLocale = locales.find(
    (locale) =>
      pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (pathnameLocale) {
    if (!isLocale(pathnameLocale)) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.replace(`/${pathnameLocale}`, `/${defaultLocale}`);
      return NextResponse.redirect(url);
    }

    const response = NextResponse.next();
    const cookieLocale = request.cookies.get(localeCookieName)?.value;
    if (cookieLocale !== pathnameLocale) {
      response.cookies.set(localeCookieName, pathnameLocale, {
        path: "/",
        maxAge: LOCALE_MAX_AGE,
        sameSite: "lax",
      });
    }
    return response;
  }

  // Unsupported fake locale segment like /xx → fall back to English
  const maybeFake = pathname.split("/")[1];
  if (
    maybeFake &&
    /^[a-z]{2}(-[a-zA-Z]{2})?$/.test(maybeFake) &&
    !isLocale(maybeFake)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(`/${maybeFake}`, `/${defaultLocale}`);
    const response = NextResponse.redirect(url);
    response.cookies.set(localeCookieName, defaultLocale, {
      path: "/",
      maxAge: LOCALE_MAX_AGE,
      sameSite: "lax",
    });
    return response;
  }

  const locale = resolvePreferredLocale({
    cookieValue: request.cookies.get(localeCookieName)?.value,
    acceptLanguage: request.headers.get("accept-language"),
  });

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  const response = NextResponse.redirect(url);
  response.cookies.set(localeCookieName, locale, {
    path: "/",
    maxAge: LOCALE_MAX_AGE,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
