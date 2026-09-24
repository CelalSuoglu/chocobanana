import { OwnerGateForm } from "@/components/owner-gate-form";
import { getOwnerPanelSecret } from "@/lib/owner-access";

export default function OwnerGatePage() {
  const configured = Boolean(getOwnerPanelSecret());

  return (
    <div>
      <h1 className="font-serif text-3xl">Owner panel access</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#c9a27a]">
        Enter the owner panel password to reach orders and memberships. This
        unlocks only <code className="text-[#f3e6d8]">/owner</code> — the public
        storefront countdown stays closed.
      </p>
      {!configured ? (
        <p className="mt-8 rounded-lg border border-amber-500/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
          Set <code>OWNER_PANEL_SECRET</code> in Preview env vars, then redeploy.
        </p>
      ) : (
        <OwnerGateForm />
      )}
    </div>
  );
}
