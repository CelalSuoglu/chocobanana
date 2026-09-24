import "server-only";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/en/login");
  }
  return session;
}

/**
 * Owner access: session must exist AND the live DB role must still be OWNER.
 * Stale JWT role alone is not enough.
 */
export async function requireOwner() {
  const session = await requireSession();

  if (!isDatabaseConfigured()) {
    redirect("/en/login");
  }

  const user = await requirePrisma().user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, email: true },
  });

  if (!user || user.role !== "OWNER") {
    redirect("/en/account");
  }

  return {
    ...session,
    user: {
      ...session.user,
      id: user.id,
      email: user.email,
      role: "OWNER" as const,
    },
  };
}

export async function getOptionalSession() {
  return auth();
}
