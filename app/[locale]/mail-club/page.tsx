import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";

export default async function MailClubRedirect({
  params,
}: PageProps<"/[locale]/mail-club">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  redirect(`/${raw}/snail-mail-club`);
}
