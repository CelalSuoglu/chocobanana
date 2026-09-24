import Image from "next/image";
import Link from "next/link";
import { OwnerBootstrapForm } from "@/components/owner-bootstrap-form";
import { Star } from "@/components/star";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";

export default async function OwnerBootstrapPage() {
  const ownerExists =
    isDatabaseConfigured() &&
    (await requirePrisma().user.count({ where: { role: "OWNER" } })) > 0;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center text-center">
      <div className="relative">
        <Star
          className="absolute -start-5 -top-1 text-sm"
          style={{ animationDelay: "0.3s" }}
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
        Creates the first OWNER account. Customer registration can never grant
        this role.
      </p>

      <div className="mt-8 w-full text-start">
        {ownerExists ? (
          <p className="owner-alert">
            Bootstrap is closed — an owner account already exists.{" "}
            <Link
              href="/owner/login"
              className="text-pink-deep underline-offset-2 hover:underline"
            >
              Sign in
            </Link>
          </p>
        ) : (
          <OwnerBootstrapForm />
        )}
      </div>
    </div>
  );
}
