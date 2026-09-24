import { SiteUnlockForm } from "@/components/site-unlock-form";
import { getComingSoonPreviewSecret } from "@/lib/site-access";

export const metadata = {
  title: "Private site access · Chocobanana",
  robots: { index: false, follow: false },
};

/**
 * Single private entry while COMING_SOON_ENABLED is on.
 * Sets an httpOnly cookie — navigate the full site without putting secrets in the URL.
 */
export default function SiteUnlockPage() {
  const configured = Boolean(getComingSoonPreviewSecret());

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-xs tracking-[0.18em] uppercase text-[#8a6a55]">
        Private access
      </p>
      <h1 className="mt-2 font-serif text-3xl text-[#3c2a22]">
        Unlock the full site
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#5c4033]">
        Visitors still see the countdown. After you unlock once, you can open
        Home, Shop, Mail Club, Register, Cart, and the rest without entering the
        password again. The password is never placed in the URL.
      </p>
      {!configured ? (
        <p className="mt-8 rounded-lg border border-amber-700/30 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>Setup required:</strong> set{" "}
          <code>COMING_SOON_PREVIEW_SECRET</code> in Vercel{" "}
          <strong>Production</strong> environment variables, then redeploy.
          Until that is set, unlock cannot work.
        </p>
      ) : (
        <SiteUnlockForm />
      )}
    </main>
  );
}
