import { SiteUnlockForm } from "@/components/site-unlock-form";
import { getComingSoonPreviewSecret } from "@/lib/site-access";

export const metadata = {
  title: "Site unlock · Chocobanana",
  robots: { index: false, follow: false },
};

export default function SiteUnlockPage() {
  const configured = Boolean(getComingSoonPreviewSecret());

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 py-16">
      <h1 className="font-serif text-3xl text-[#3c2a22]">Site preview unlock</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#5c4033]">
        Enter the preview password to browse the full site while coming soon is
        active for everyone else. Secrets are never accepted in the URL.
      </p>
      {!configured ? (
        <p className="mt-8 rounded-lg border border-amber-700/30 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Set <code>COMING_SOON_PREVIEW_SECRET</code> in the environment, then
          redeploy.
        </p>
      ) : (
        <SiteUnlockForm />
      )}
    </main>
  );
}
