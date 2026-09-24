import type { ReactNode } from "react";
import { requireOwner } from "@/lib/auth/session";

export default async function OwnerPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireOwner();
  return children;
}
