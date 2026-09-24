import type { ReactNode } from "react";

/** Root shell — locale-specific `<html>` lives in `app/[locale]/layout.tsx`. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
