import { connection } from "next/server";
import { OffersList } from "@/components/account/OffersList";
import { OffersPageIntro } from "@/components/account/OffersPageIntro";
import { getBuyerOffers } from "@/lib/data/offers";
import { getProducts, getProductsByIds } from "@/lib/data/products";

interface OffersPageProps {
  params: Promise<{ country: string; locale: string }>;
}

export default async function OffersPage({ params }: OffersPageProps) {
  await connection();
  const { country, locale } = await params;
  const basePath = `/${country}/${locale}`;
  const [response, popularResponse] = await Promise.all([
    getBuyerOffers({ limit: 50 }),
    getProducts({ limit: 5, sort: "popular" }),
  ]);
  const products = response.data.length
    ? await getProductsByIds(response.data.map((offer) => offer.product_id))
    : [];

  return (
    <div className="space-y-5 overflow-hidden">
      <OffersPageIntro />
      <OffersList
        offers={response.data}
        products={products}
        popularProducts={popularResponse.data.slice(0, 5)}
        basePath={basePath}
        locale={locale}
      />
    </div>
  );
}
