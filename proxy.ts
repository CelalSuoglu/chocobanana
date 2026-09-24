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
  getComingSoonPreviewSecret,
  hasValidPreviewAccess,
  isComingSoonEnabled,
  previewCookieName,
} from "./lib/site-access";
import {
  getOwnerPanelSecret,
  hasValidOwnerPanelAccess,
  ownerPanelCookieName,
} from "./lib/owner-access";

const LOCALE_MAX_AGE = 60 * 60 * 24 * 365;
const PREVIEW_MAX_AGE = 60 * 60 * 24 * 60; // 60 days — covers the 40-day wait
const OWNER_PANEL_MAX_AGE = 60 * 60 * 24 * 60;

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

function applyPreviewUnlock(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const secret = getComingSoonPreviewSecret();
  const preview = request.nextUrl.searchParams.get("preview");

  if (!secret || !preview) return response;

  if (preview === "off") {
    response.cookies.delete(previewCookieName);
    return response;
  }

  if (preview === secret) {
    response.cookies.set(previewCookieName, secret, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: PREVIEW_MAX_AGE,
    });
  }

  return response;
}

function stripPreviewParam(request: NextRequest) {
  const url = request.nextUrl.clone();
  if (!url.searchParams.has("preview")) return null;
  url.searchParams.delete("preview");
  return url;
}

function applyOwnerPanelUnlock(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const secret = getOwnerPanelSecret();
  const owner = request.nextUrl.searchParams.get("owner");

  if (!secret || !owner) return response;

  if (owner === "off") {
    response.cookies.delete(ownerPanelCookieName);
    return response;
  }

  if (owner === secret) {
    response.cookies.set(ownerPanelCookieName, secret, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: OWNER_PANEL_MAX_AGE,
    });
  }

  return response;
}

function stripOwnerParam(request: NextRequest) {
  const url = request.nextUrl.clone();
  if (!url.searchParams.has("owner")) return null;
  url.searchParams.delete("owner");
  return url;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = getComingSoonPreviewSecret();
  const previewParam = request.nextUrl.searchParams.get("preview");
  const ownerSecret = getOwnerPanelSecret();
  const ownerParam = request.nextUrl.searchParams.get("owner");

  // Unlock / lock preview access, then continue without the secret in the URL.
  if (
    isComingSoonEnabled() &&
    secret &&
    previewParam &&
    (previewParam === secret || previewParam === "off")
  ) {
    const clean = stripPreviewParam(request) ?? request.nextUrl.clone();
    let response = NextResponse.redirect(clean);
    response = applyPreviewUnlock(request, response);
    return response;
  }

  // Owner-panel-only unlock (does not open the public storefront).
  if (
    ownerSecret &&
    ownerParam &&
    (ownerParam === ownerSecret || ownerParam === "off")
  ) {
    const clean = stripOwnerParam(request) ?? request.nextUrl.clone();
    if (!clean.pathname.startsWith("/owner")) {
      clean.pathname = "/owner/gate";
    }
    let response = NextResponse.redirect(clean);
    response = applyOwnerPanelUnlock(request, response);
    return response;
  }

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

  // Auth endpoints needed after owner-panel unlock while the public site stays gated.
  if (
    gateActive &&
    ownerPanelUnlocked &&
    (pathname.startsWith("/api/auth") || pathname.startsWith("/en/sign-"))
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
