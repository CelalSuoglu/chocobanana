import { redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";

/** Keep /sign-in as an alias of /login. */
export default async function SignInAliasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "en";
  redirect(`/${locale}/login`);
}
