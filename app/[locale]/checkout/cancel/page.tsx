import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function CheckoutCancelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();

  const dict = await getDictionary(rawLocale);

  return (
    <main className="section-pad mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center py-16 text-center">
      <p className="font-script text-2xl text-pink-deep">
        {dict.checkout.cancelEyebrow}
      </p>
      <h1 className="mt-2 font-serif text-3xl text-chocolate md:text-4xl">
        {dict.checkout.cancelTitle}
      </h1>
      <p className="mt-4 text-chocolate-soft">{dict.checkout.cancelBody}</p>
      <Link
        href={`/${rawLocale}#shop`}
        className="mt-8 inline-flex items-center justify-center rounded-full border border-chocolate/80 px-7 py-3 font-serif text-sm tracking-[0.16em] uppercase text-chocolate transition-colors hover:border-pink-deep hover:bg-pink-soft/60"
      >
        {dict.checkout.backToShop}
      </Link>
    </main>
  );
}
