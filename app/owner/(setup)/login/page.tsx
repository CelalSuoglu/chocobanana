import Link from "next/link";
import { OwnerLoginForm } from "@/components/owner-login-form";
import { isDatabaseConfigured } from "@/lib/db";

export default function OwnerLoginPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl">Owner sign in</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#c9a27a]">
        Use the OWNER account created via bootstrap. Customer accounts cannot
        open this panel.
      </p>
      {!isDatabaseConfigured() ? (
        <p className="mt-8 rounded-lg border border-amber-500/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
          DATABASE_URL is required before owner login and before memberships or
          orders can be stored.
        </p>
      ) : (
        <OwnerLoginForm />
      )}
      <p className="mt-6 text-sm text-[#c9a27a]">
        First time?{" "}
        <Link href="/owner/bootstrap" className="text-[#f3e6d8] underline">
          Create the owner account
        </Link>
      </p>
    </div>
  );
}
