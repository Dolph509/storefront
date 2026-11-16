import { redirect } from "next/navigation";

export default async function BlockedShopsRedirectPage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country, locale } = await params;
  redirect(`/${country}/${locale}/account/settings/privacy`);
}
