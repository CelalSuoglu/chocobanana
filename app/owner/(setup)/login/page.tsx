import Link from "next/link";
import { OwnerLoginForm } from "@/components/owner-login-form";
import { isDatabaseConfigured } from "@/lib/db";

export default function OwnerLoginPage() {
  return (
    <div className="mx-auto max-w-lg">
      <p className="text-xs tracking-[0.18em] uppercase text-chocolate-soft">
        Owner account
      </p>
      <h1 className="mt-2 font-serif text-3xl text-chocolate">Sign in</h1>
      <p className="mt-3 text-sm leading-relaxed text-chocolate-soft">
        Use the OWNER account. Customer accounts cannot open this panel.
      </p>
      {!isDatabaseConfigured() ? (
        <p className="owner-alert mt-8">
          DATABASE_URL is required before owner login and before memberships or
          orders can be stored.
        </p>
      ) : (
        <OwnerLoginForm />
      )}
      <p className="mt-6 text-sm text-chocolate-soft">
        First time?{" "}
        <Link
          href="/owner/bootstrap"
          className="text-pink-deep underline-offset-2 hover:underline"
        >
          Create the owner account
        </Link>
      </p>
    </div>
  );
}
