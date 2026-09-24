import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  locales,
} from "./lib/i18n/config";
import { resolvePreferredLocale } from "./lib/i18n/resolve-locale";
import {
  hasValidPreviewAccess,
  isComingSoonEnabled,
  previewCookieName,
} from "./lib/site-access";
import {
  hasValidOwnerPanelAccess,
  ownerPanelCookieName,
} from "./lib/owner-access";

const LOCALE_MAX_AGE = 60 * 60 * 24 * 365;

function comingSoonApiResponse() {
  return NextResponse.json(
    { error: "Chocobanana is in coming-soon mode. APIs are unavailable." },
    { status: 503 },
  );
}

function redirectToLocaleHome(request: NextRequest, locale: string) {
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}`;
  url.search = "";
  return NextResponse.redirect(url);
}

function isGateActive(request: NextRequest): boolean {
  if (!isComingSoonEnabled()) return false;
  return !hasValidPreviewAccess(
    request.cookies.get(previewCookieName)?.value,
  );
}

/** Strip legacy secret query params without granting access. */
function stripSecretQueryParams(request: NextRequest): NextResponse | null {
  const url = request.nextUrl.clone();
  let dirty = false;
  if (url.searchParams.has("preview")) {
    url.searchParams.delete("preview");
    dirty = true;
  }
  if (url.searchParams.has("owner")) {
    url.searchParams.delete("owner");
    dirty = true;
  }
  if (!dirty) return null;
  return NextResponse.redirect(url);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never accept secrets via URL — drop ?preview= / ?owner= without unlocking.
  const stripped = stripSecretQueryParams(request);
  if (stripped) return stripped;

  const gateActive = isGateActive(request);
  const ownerPanelUnlocked = hasValidOwnerPanelAccess(
    request.cookies.get(ownerPanelCookieName)?.value,
  );

  // Stripe webhooks have no preview cookie — always allow signature-verified handler.
  if (
    pathname === "/api/webhooks/stripe" ||
    pathname.startsWith("/api/webhooks/stripe/")
  ) {
    return NextResponse.next();
  }

  // Form-based site unlock while the public countdown is showing.
  if (pathname === "/site-unlock" || pathname.startsWith("/site-unlock/")) {
    return NextResponse.next();
  }

  // Auth endpoints needed after owner-panel unlock while the public site stays gated.
  if (
    gateActive &&
    ownerPanelUnlocked &&
    (pathname.startsWith("/api/auth") ||
      pathname.includes("/sign-") ||
      pathname.includes("/login") ||
      pathname.includes("/register") ||
      pathname.includes("/forgot-password") ||
      pathname.includes("/reset-password") ||
      pathname.includes("/verify-email"))
  ) {
    return NextResponse.next();
  }

  if (gateActive && pathname.startsWith("/api/")) {
    return comingSoonApiResponse();
  }

  // Owner panel lives outside the locale site shell.
  if (pathname === "/owner" || pathname.startsWith("/owner/")) {
    const publicOwnerPaths =
      pathname === "/owner/gate" || pathname.startsWith("/owner/gate/");

    if (gateActive && !ownerPanelUnlocked && !publicOwnerPaths) {
      const url = request.nextUrl.clone();
      url.pathname = "/owner/gate";
      url.search = "";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

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

    // Public coming-soon: only the locale home is reachable.
    if (gateActive && pathname !== `/${pathnameLocale}`) {
      return redirectToLocaleHome(request, pathnameLocale);
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
    if (gateActive) {
      url.pathname = `/${defaultLocale}`;
      url.search = "";
    }
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
  if (gateActive) {
    url.pathname = `/${locale}`;
    url.search = "";
  } else {
    url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  }
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
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
