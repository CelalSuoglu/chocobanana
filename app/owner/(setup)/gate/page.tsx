import { OwnerGateForm } from "@/components/owner-gate-form";
import { getOwnerPanelSecret } from "@/lib/owner-access";

export default function OwnerGatePage() {
  const configured = Boolean(getOwnerPanelSecret());

  return (
    <div className="mx-auto max-w-lg">
      <p className="text-xs tracking-[0.18em] uppercase text-[#cbb3a0]">
        Private access
      </p>
      <h1 className="mt-2 font-serif text-3xl text-[#faf6ef]">
        Unlock owner panel
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#cbb3a0]">
        Enter the owner panel password. This only opens{" "}
        <code className="text-[#c98b96]">/owner</code> — the public countdown
        stays closed for visitors.
      </p>
      {!configured ? (
        <p className="owner-alert mt-8">
          Set <code>OWNER_PANEL_SECRET</code> in Vercel{" "}
          <strong>Production</strong> environment variables, then redeploy.
        </p>
      ) : (
        <OwnerGateForm />
      )}
    </div>
  );
}
