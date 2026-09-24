import { OwnerBootstrapForm } from "@/components/owner-bootstrap-form";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";

export default async function OwnerBootstrapPage() {
  const ownerExists =
    isDatabaseConfigured() &&
    (await requirePrisma().user.count({ where: { role: "OWNER" } })) > 0;

  return (
    <div>
      <h1 className="font-serif text-3xl">Owner bootstrap</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#c9a27a]">
        Creates the first OWNER account. Customer registration can never grant
        this role. After one owner exists, bootstrap stays closed. Set{" "}
        <code className="text-[#f3e6d8]">OWNER_BOOTSTRAP_SECRET</code> in the
        server environment only.
      </p>
      {ownerExists ? (
        <p className="mt-8 rounded-lg border border-amber-500/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
          Bootstrap is closed — an owner account already exists. Sign in at{" "}
          <code className="text-[#f3e6d8]">/owner/login</code>.
        </p>
      ) : (
        <OwnerBootstrapForm />
      )}
    </div>
  );
}
