import { getTranslations } from "next-intl/server";
import { ProductRecommendationRail } from "@/components/products/ProductRecommendationRail";
import { getSimilarToSavedProducts } from "@/lib/data/recommendations";
import { getAccessToken } from "@/lib/spree/cookies";

export async function FavoritesDiscoveryRail({
  basePath,
  locale,
  currency,
}: {
  basePath: string;
  locale: string;
  currency?: string;
}) {
  const token = await getAccessToken();
  if (!token) return null;

  const products = await getSimilarToSavedProducts();
  if (!products.length) return null;

  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "account",
  });

  return (
    <div className="mt-10 border-t border-marketplace-border-subtle pt-8">
      <ProductRecommendationRail
        title={t("discoveryInspiredBySaved")}
        products={products}
        basePath={basePath}
        currency={currency}
        listId="favorites-discovery"
        listName={t("discoveryInspiredBySaved")}
        variant="etsy"
        dismissSurface="favorites:inspired"
        analyticsSurface="favorites"
        personalized
      />
    </div>
  );
}
