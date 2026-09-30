import Image from "next/image";
import type { ReactNode } from "react";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  intro: string;
  logoAlt: string;
  notice?: string;
  children: ReactNode;
};

/** Shared branded frame for customer sign-in / register pages. */
export function AuthPageShell({
  eyebrow,
  title,
  intro,
  logoAlt,
  notice,
  children,
}: AuthPageShellProps) {
  return (
    <main className="section-pad flex-1 py-10 md:py-16">
      <div className="mx-auto max-w-xl">
        <div className="text-center">
          <Image
            src="/logo.jpg"
            alt={logoAlt}
            width={96}
            height={96}
            priority
            className="mx-auto h-20 w-20 rounded-full object-cover ring-1 ring-pink/50"
          />
          <p className="kicker mt-5">{eyebrow}</p>
          <h1 className="page-title mt-2 text-[clamp(2rem,4vw,2.6rem)]">{title}</h1>
          <p className="page-lead mx-auto text-sm md:text-base">{intro}</p>
        </div>

        {notice ? (
          <p className="notice notice-ok mt-6 text-center" role="status">
            {notice}
          </p>
        ) : null}

        <div className="store-card mt-8 px-5 py-7 sm:px-8 sm:py-8">{children}</div>
      </div>
    </main>
  );
}
