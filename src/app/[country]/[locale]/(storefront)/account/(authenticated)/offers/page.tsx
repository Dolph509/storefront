import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { OffersList } from "@/components/account/OffersList";
import { getBuyerOffers } from "@/lib/data/offers";

interface OffersPageProps {
  params: Promise<{ country: string; locale: string }>;
}

export default async function OffersPage({ params }: OffersPageProps) {
  await connection();
  const { country, locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "offers",
  });
  const basePath = `/${country}/${locale}`;
  const response = await getBuyerOffers({ limit: 50 });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("title")}</h1>
      <OffersList offers={response.data} basePath={basePath} locale={locale} />
    </div>
  );
}
