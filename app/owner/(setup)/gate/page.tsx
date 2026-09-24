import { OwnerGateForm } from "@/components/owner-gate-form";
import { Star } from "@/components/star";
import { getOwnerPanelSecret } from "@/lib/owner-access";

export default function OwnerGatePage() {
  const configured = Boolean(getOwnerPanelSecret());

  return (
    <div className="mx-auto max-w-lg">
      <p className="text-xs tracking-[0.18em] uppercase text-chocolate-soft">
        Private access
      </p>
      <h1 className="relative mt-2 font-serif text-3xl text-chocolate">
        <Star
          className="absolute -start-5 top-1 text-sm"
          style={{ animationDelay: "0.3s" }}
        />
        Unlock owner panel
        <Star
          className="ms-2 align-super text-xs"
          style={{ animationDelay: "1.1s" }}
        />
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-chocolate-soft">
        Enter the owner panel password. This only opens{" "}
        <code className="text-pink-deep">/owner</code> — the public countdown
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
