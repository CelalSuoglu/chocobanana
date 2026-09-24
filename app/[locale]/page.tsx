import { notFound } from "next/navigation";
import { HomePage } from "@/components/home-page";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function LocaleHomePage({
  params,
}: PageProps<"/[locale]">) {
  const { locale: raw } = await params;

  if (!isLocale(raw)) {
    notFound();
  }

  const dict = await getDictionary(raw);

  return <HomePage locale={raw} dict={dict} />;
}
