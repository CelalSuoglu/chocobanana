import "server-only";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/en/sign-in");
  }
  return session;
}

export async function requireOwner() {
  const session = await requireSession();
  if (session.user.role !== "OWNER") {
    redirect("/en/account");
  }
  return session;
}

export async function getOptionalSession() {
  return auth();
}
