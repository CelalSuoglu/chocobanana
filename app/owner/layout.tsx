import Link from "next/link";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Lora } from "next/font/google";
import { isDatabaseConfigured } from "@/lib/db";
import "../globals.css";
import "./owner.css";

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

/** Shared owner chrome — separate from the customer storefront. */
export default function OwnerRootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`owner-shell ${serif.variable} ${body.variable} h-full antialiased`}
    >
      <body className="owner-shell flex min-h-full flex-col bg-[#1c1511] text-[#faf6ef]">
        <header className="border-b border-[rgba(232,180,188,0.22)] bg-[#241c17]">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#cbb3a0]">
                Operations
              </p>
              <Link
                href="/owner"
                className="font-serif text-xl text-[#faf6ef] transition-colors hover:text-[#c98b96]"
              >
                Chocobanana Owner
              </Link>
            </div>
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <Link href="/owner" className="owner-nav-link">
                Dashboard
              </Link>
              <Link href="/owner/orders" className="owner-nav-link">
                Orders
              </Link>
              <Link href="/owner/members" className="owner-nav-link">
                Members
              </Link>
              <Link href="/owner/gate" className="owner-nav-link">
                Unlock
              </Link>
              <Link href="/owner/login" className="owner-nav-link">
                Sign in
              </Link>
              <Link
                href="/en"
                className="owner-nav-link rounded-full border border-[rgba(232,180,188,0.28)] px-3 py-1"
              >
                View site
              </Link>
            </nav>
          </div>
        </header>
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
          {!isDatabaseConfigured() ? (
            <p className="owner-alert mb-6">
              DATABASE_URL is not set. Memberships and orders need Postgres in
              this environment.
            </p>
          ) : null}
          {children}
        </div>
      </body>
    </html>
  );
}
