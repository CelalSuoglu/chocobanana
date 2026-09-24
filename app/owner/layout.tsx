import Link from "next/link";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Lora } from "next/font/google";
import { isDatabaseConfigured } from "@/lib/db";
import "../globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const body = Lora({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Owner · Chocobanana",
  robots: { index: false, follow: false },
};

/** Shared owner chrome — auth gate lives in `(panel)` only so bootstrap stays reachable. */
export default function OwnerRootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#1a1410] text-[#f3e6d8]">
        <header className="border-b border-white/10 bg-[#120e0b]">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#c9a27a]">
                Operations
              </p>
              <Link href="/owner" className="font-serif text-xl text-[#f3e6d8]">
                Chocobanana Owner
              </Link>
            </div>
            <nav className="flex flex-wrap gap-4 text-sm text-[#c9a27a]">
              <Link href="/owner" className="hover:text-[#f3e6d8]">
                Dashboard
              </Link>
              <Link href="/owner/orders" className="hover:text-[#f3e6d8]">
                Orders
              </Link>
              <Link href="/owner/members" className="hover:text-[#f3e6d8]">
                Members
              </Link>
              <Link href="/owner/catalog" className="hover:text-[#f3e6d8]">
                Catalog (soon)
              </Link>
              <Link href="/owner/login" className="hover:text-[#f3e6d8]">
                Sign in
              </Link>
              <Link href="/owner/gate" className="hover:text-[#f3e6d8]">
                Unlock
              </Link>
              <Link href="/en" className="hover:text-[#f3e6d8]">
                View site
              </Link>
            </nav>
          </div>
        </header>
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
          {!isDatabaseConfigured() ? (
            <p className="mb-6 rounded-lg border border-amber-500/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
              DATABASE_URL is not set. Orders will not appear until Postgres is
              configured on this environment.
            </p>
          ) : null}
          {children}
        </div>
      </body>
    </html>
  );
}
