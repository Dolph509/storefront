import { redirect } from "next/navigation";

/** Legacy bookmark → Public Profile settings tab. */
export default async function ProfileRedirectPage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country, locale } = await params;
  redirect(`/${country}/${locale}/account/settings/public-profile`);
}
