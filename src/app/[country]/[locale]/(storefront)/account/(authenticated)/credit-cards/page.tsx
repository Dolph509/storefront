import { redirect } from "next/navigation";

export default async function CreditCardsRedirectPage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country, locale } = await params;
  redirect(`/${country}/${locale}/account/settings/credit-cards`);
}
