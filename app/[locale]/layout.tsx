import type { Metadata } from "next";
import { Caveat, Cormorant_Garamond, Lora, Noto_Naskh_Arabic, Noto_Sans_JP, Noto_Sans_SC } from "next/font/google";
import { notFound } from "next/navigation";
import {
  getDirection,
  isLocale,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import "../globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
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
    title: dict.meta.title,
    description: dict.meta.description,
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

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${serif.variable} ${script.variable} ${body.variable} ${arabic.variable} ${japanese.variable} ${chinese.variable} ${localeFontClass(locale)} h-full antialiased`}
    >
      <body
        className={`min-h-full flex flex-col font-sans text-chocolate ${
          locale === "ar"
            ? "[font-family:var(--font-arabic),var(--font-body),serif]"
            : locale === "ja"
              ? "[font-family:var(--font-japanese),var(--font-body),sans-serif]"
              : locale === "zh"
                ? "[font-family:var(--font-chinese),var(--font-body),sans-serif]"
                : ""
        }`}
      >
        {children}
      </body>
    </html>
  );
}
