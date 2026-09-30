import type { ReactNode } from "react";
import { Cormorant_Garamond, Lora } from "next/font/google";
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

export default function SiteUnlockLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans text-chocolate">
        {children}
      </body>
    </html>
  );
}
