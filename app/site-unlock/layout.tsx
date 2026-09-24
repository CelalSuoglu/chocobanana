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
      <body className="min-h-full bg-[#f7f0e8] font-sans text-[#3c2a22]">
        {children}
      </body>
    </html>
  );
}
