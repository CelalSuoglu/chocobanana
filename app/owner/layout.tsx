import type { ReactNode } from "react";
import { Caveat, Cormorant_Garamond, Lora } from "next/font/google";
import { OwnerChrome } from "@/components/owner-chrome";
import "../globals.css";
import "./owner.css";

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

export const metadata = {
  title: "Owner · Chocobanana",
  robots: { index: false, follow: false },
};

/** Shared owner chrome — same brand palette as the storefront, without shop navigation. */
export default function OwnerRootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`owner-shell ${serif.variable} ${script.variable} ${body.variable} h-full antialiased`}
    >
      <body className="owner-shell flex min-h-full flex-col">
        <OwnerChrome>{children}</OwnerChrome>
      </body>
    </html>
  );
}
