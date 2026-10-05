import { redirect } from "next/navigation";

export default async function AddressesRedirectPage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country, locale } = await params;
  redirect(`/${country}/${locale}/account/settings/addresses`);
}
