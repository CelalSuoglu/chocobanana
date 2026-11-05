import type { Metadata, Viewport } from "next";
import {
  Bebas_Neue,
  Caveat,
  Gluten,
  Lora,
  Noto_Naskh_Arabic,
  Noto_Sans_JP,
  Noto_Sans_SC,
} from "next/font/google";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import {
  getDirection,
  isLocale,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getNativeAppContext } from "@/lib/native/app-context";
import "../globals.css";

/** Headings: soft, slightly curly retro serif (Didem's pick), in chocolate. */
const serif = Gluten({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: "variable",
});

const script = Caveat({
  variable: "--font-script",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const body = Lora({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const display = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const arabic = Noto_Naskh_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

const japanese = Noto_Sans_JP({
  variable: "--font-japanese",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const chinese = Noto_Sans_SC({
  variable: "--font-chinese",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

/** Public HTML must not stay cached after a 30-minute opening ends. */
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "en";
  const dict = await getDictionary(locale);

  return {
    title: {
      default: dict.meta.title,
      template: `%s · ${dict.meta.title}`,
    },
    description: dict.meta.description,
    // Unique /icons/logo-* paths — Safari caches /favicon.ico aggressively.
    icons: {
      icon: [
        { url: "/icons/logo-fav-32.png", sizes: "32x32", type: "image/png" },
        { url: "/icons/logo-fav-16.png", sizes: "16x16", type: "image/png" },
        { url: "/icons/logo-fav.ico", sizes: "48x48", type: "image/x-icon" },
        { url: "/icons/logo-icon.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [
        { url: "/icons/logo-apple.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: "/icons/logo-fav-32.png",
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const app = await getNativeAppContext();
  if (!app.isApp) {
    // Same as the Next.js default the website already used.
    return { width: "device-width", initialScale: 1 };
  }
  // In the app, draw under the notch/home indicator; CSS pads with safe-area insets.
  return {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: "#fffbee",
  };
}

function localeFontClass(locale: Locale): string {
  if (locale === "ar") return arabic.variable;
  if (locale === "ja") return japanese.variable;
  if (locale === "zh") return chinese.variable;
  return "";
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale: raw } = await params;

  if (!isLocale(raw)) {
    notFound();
  }

  const locale = raw;
  const direction = getDirection(locale);
  const dict = await getDictionary(locale);
  const app = await getNativeAppContext();

  return (
    <html
      lang={locale}
      dir={direction}
      data-app={app.isApp ? (app.platform ?? "native") : undefined}
      className={`${serif.variable} ${script.variable} ${body.variable} ${display.variable} ${arabic.variable} ${japanese.variable} ${chinese.variable} ${localeFontClass(locale)} h-full antialiased`}
    >
      <body
        className={`flex min-h-full flex-col font-sans text-chocolate ${
          locale === "ar"
            ? "[font-family:var(--font-arabic),var(--font-body),serif]"
            : locale === "ja"
              ? "[font-family:var(--font-japanese),var(--font-body),sans-serif]"
              : locale === "zh"
                ? "[font-family:var(--font-chinese),var(--font-body),sans-serif]"
                : ""
        }`}
      >
        <SiteShell locale={locale} dict={dict}>
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
