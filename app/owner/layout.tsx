import Link from "next/link";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Lora } from "next/font/google";
import { Star } from "@/components/star";
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

const SPARKLES = [
  { top: "6%", left: "8%", delay: "0s", size: "text-sm", tone: "gold" },
  { top: "10%", left: "26%", delay: "0.5s", size: "text-xs", tone: "pink" },
  { top: "8%", left: "74%", delay: "1.2s", size: "text-sm", tone: "gold" },
  { top: "14%", left: "90%", delay: "0.8s", size: "text-base", tone: "pink" },
  { top: "22%", left: "5%", delay: "1.7s", size: "text-xs", tone: "gold" },
  { top: "28%", left: "48%", delay: "2.1s", size: "text-sm", tone: "pink" },
  { top: "36%", left: "84%", delay: "0.4s", size: "text-xs", tone: "gold" },
  { top: "48%", left: "12%", delay: "1.5s", size: "text-sm", tone: "pink" },
  { top: "58%", left: "92%", delay: "0.9s", size: "text-xs", tone: "gold" },
  { top: "68%", left: "20%", delay: "2.3s", size: "text-sm", tone: "pink" },
  { top: "76%", left: "70%", delay: "1.1s", size: "text-xs", tone: "gold" },
  { top: "86%", left: "40%", delay: "1.9s", size: "text-sm", tone: "pink" },
  { top: "18%", left: "60%", delay: "2.6s", size: "text-xs", tone: "gold" },
  { top: "42%", left: "36%", delay: "0.6s", size: "text-sm", tone: "pink" },
] as const;

/** Shared owner chrome — same brand palette as the storefront. */
export default function OwnerRootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`owner-shell ${serif.variable} ${body.variable} h-full antialiased`}
    >
      <body className="owner-shell flex min-h-full flex-col">
        <div aria-hidden="true" className="owner-glow" />
        <div aria-hidden="true" className="owner-sparkles">
          {SPARKLES.map((sparkle, index) => (
            <span
              key={index}
              className={`owner-sparkle owner-sparkle--${sparkle.tone} ${sparkle.size}`}
              style={{
                top: sparkle.top,
                left: sparkle.left,
                animationDelay: sparkle.delay,
              }}
            >
              ✦
            </span>
          ))}
        </div>

        <header className="owner-header">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <div className="relative">
              <Star
                className="absolute -start-4 -top-2 text-xs"
                style={{ animationDelay: "0.4s" }}
              />
              <p className="text-xs tracking-[0.2em] uppercase text-chocolate-soft">
                Operations
              </p>
              <Link
                href="/owner"
                className="font-serif text-xl text-chocolate transition-colors hover:text-pink-deep"
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
                className="owner-nav-link rounded-full border border-pink/40 px-3 py-1"
              >
                View site
              </Link>
            </nav>
          </div>
        </header>
        <div className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
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
