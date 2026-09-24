import { OwnerBootstrapForm } from "@/components/owner-bootstrap-form";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import Link from "next/link";

export default async function OwnerBootstrapPage() {
  const ownerExists =
    isDatabaseConfigured() &&
    (await requirePrisma().user.count({ where: { role: "OWNER" } })) > 0;

  return (
    <div className="mx-auto max-w-lg">
      <p className="text-xs tracking-[0.18em] uppercase text-[#cbb3a0]">
        First-time setup
      </p>
      <h1 className="mt-2 font-serif text-3xl text-[#faf6ef]">
        Owner bootstrap
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#cbb3a0]">
        Creates the first OWNER account. Customer registration can never grant
        this role. After one owner exists, bootstrap stays closed.
      </p>
      {ownerExists ? (
        <p className="owner-alert mt-8">
          Bootstrap is closed — an owner account already exists.{" "}
          <Link
            href="/owner/login"
            className="text-[#c98b96] underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </p>
      ) : (
        <OwnerBootstrapForm />
      )}
    </div>
  );
}
