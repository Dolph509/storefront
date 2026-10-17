import { getTranslations } from "next-intl/server";
import { ProductRecommendationRail } from "@/components/products/ProductRecommendationRail";
import {
  type DiscoveryRecommendationContext,
  getPersonalizedDiscoveryProducts,
} from "@/lib/data/recommendations";

export async function DiscoveryRecommendationRail({
  context,
  basePath,
  currency,
  locale,
  titleKey = "recommendedForYou",
  listId,
  dismissSurface,
}: {
  context: DiscoveryRecommendationContext;
  basePath: string;
  currency?: string;
  locale: string;
  titleKey?: string;
  listId: string;
  dismissSurface: string;
}) {
  const { products, personalized } =
    await getPersonalizedDiscoveryProducts(context);
  if (!products.length) return null;

  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  return (
    <ProductRecommendationRail
      title={t(titleKey)}
      products={products}
      basePath={basePath}
      currency={currency}
      listId={listId}
      listName={t(titleKey)}
      variant="etsy"
      dismissSurface={dismissSurface}
      analyticsSurface={context.surface}
      personalized={personalized}
    />
  );
}
