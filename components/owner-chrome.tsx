import type { ReactNode } from "react";
import { OwnerHeader } from "@/components/owner-header";
import { getOptionalSession } from "@/lib/auth/session";
import { isDatabaseConfigured } from "@/lib/db";

/**
 * Auth-aware owner chrome. Panel routes still enforce requireOwner separately.
 * Guest chrome never exposes customer nav or mixes sessions.
 */
export async function OwnerChrome({ children }: { children: ReactNode }) {
  const session = await getOptionalSession();
  const ownerUser =
    session?.user?.role === "OWNER" && session.user.id ? session.user : null;

  return (
    <>
      {ownerUser ? (
        <OwnerHeader
          mode="owner"
          name={ownerUser.name ?? null}
          email={ownerUser.email ?? ""}
        />
      ) : (
        <OwnerHeader mode="guest" />
      )}
      <div className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {!isDatabaseConfigured() ? (
          <p className="owner-alert mb-6">
            DATABASE_URL is not set. Memberships and orders need Postgres in
            this environment.
          </p>
        ) : null}
        {children}
      </div>
      <footer className="relative z-10 border-t border-[color:var(--owner-border)] px-4 py-8 text-center">
        <p className="font-serif tracking-[0.14em] text-chocolate">Chocobanana</p>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-chocolate-soft">
          Owner workspace
        </p>
        <p className="mt-3 font-script text-lg text-chocolate-soft">by Didem Keskin</p>
      </footer>
    </>
  );
}
