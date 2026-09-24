import Image from "next/image";
import Link from "next/link";
import { OwnerLoginForm } from "@/components/owner-login-form";
import { Star } from "@/components/star";
import { isDatabaseConfigured } from "@/lib/db";

export default function OwnerLoginPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center text-center">
      <div className="relative">
        <Star
          className="absolute -start-5 -top-1 text-sm"
          style={{ animationDelay: "0.35s" }}
        />
        <Star
          className="absolute -end-4 top-8 text-xs"
          style={{ animationDelay: "1.2s" }}
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
        Sign in with the OWNER account. Customer accounts cannot open this
        panel.
      </p>

      <div className="mt-8 w-full text-start">
        {!isDatabaseConfigured() ? (
          <p className="owner-alert">
            DATABASE_URL is required before owner login and before memberships
            or orders can be stored.
          </p>
        ) : (
          <OwnerLoginForm />
        )}
      </div>

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
