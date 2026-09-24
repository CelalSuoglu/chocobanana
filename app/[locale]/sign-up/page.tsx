import { redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";

/** Keep /sign-up as an alias of /register. */
export default async function SignUpAliasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "en";
  redirect(`/${locale}/register`);
}
