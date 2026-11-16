import { connection } from "next/server";
import { CreditCardsSettingsClient } from "@/components/account/CreditCardsSettingsClient";
import { getCreditCards } from "@/lib/data/credit-cards";

interface SettingsCreditCardsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SettingsCreditCardsPage({
  params,
}: SettingsCreditCardsPageProps) {
  await connection();
  await params;
  const response = await getCreditCards();

  return <CreditCardsSettingsClient initialCards={response.data} />;
}
