import Image from "next/image";
import Link from "next/link";
import { OwnerGateForm } from "@/components/owner-gate-form";
import { Star } from "@/components/star";
import { getOwnerPanelSecret } from "@/lib/owner-access";

export default function OwnerGatePage() {
  const configured = Boolean(getOwnerPanelSecret());

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center text-center">
      <div className="relative">
        <Star
          className="absolute -start-5 -top-1 text-sm"
          style={{ animationDelay: "0.3s" }}
        />
        <Star
          className="absolute -end-4 top-8 text-xs"
          style={{ animationDelay: "1.1s" }}
        />
        <Image
          src="/logo.jpg"
          alt="Chocobanana"
          width={120}
          height={120}
          priority
          className="h-24 w-24 rounded-full object-cover shadow-[0_12px_36px_rgba(60,42,34,0.12)] ring-1 ring-pink/40 sm:h-28 sm:w-28"
        />
      </div>

      <p className="mt-6 font-script text-3xl text-pink-deep sm:text-4xl">
        Owner Portal
      </p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-chocolate-soft">
        Unlock the private ops panel. The public countdown stays closed for
        visitors.
      </p>

      <Link href="/owner/login" className="owner-btn owner-btn-primary mt-6 w-full max-w-xs">
        Sign in
      </Link>

      <div className="mt-10 w-full text-start">
        <p className="text-xs tracking-[0.18em] uppercase text-chocolate-soft">
          Panel password
        </p>
        {!configured ? (
          <p className="owner-alert mt-4">
            Set <code>OWNER_PANEL_SECRET</code> in Vercel{" "}
            <strong>Production</strong> environment variables, then redeploy.
          </p>
        ) : (
          <OwnerGateForm />
        )}
      </div>
    </div>
  );
}
