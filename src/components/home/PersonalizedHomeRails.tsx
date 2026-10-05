import { getTranslations } from "next-intl/server";
import { ProductRecommendationRail } from "@/components/products/ProductRecommendationRail";
import { getCustomer } from "@/lib/data/customer";
import {
  getRecommendedForYouProducts,
  getSimilarToSavedProducts,
} from "@/lib/data/recommendations";
import { HOME_RAIL_MIN_PRODUCTS } from "@/lib/data/recommendations-constants";

interface PersonalizedHomeRailsProps {
  basePath: string;
  currency?: string;
}

export async function PersonalizedHomeRails({
  basePath,
  currency,
}: PersonalizedHomeRailsProps) {
  const customer = await getCustomer();
  if (!customer || customer.personalization_enabled === false) {
    return null;
  }

  const [recommendedProducts, similarToSavedProducts] = await Promise.all([
    getRecommendedForYouProducts(),
    getSimilarToSavedProducts(),
  ]);

  const recommendedIds = new Set(
    recommendedProducts.map((product) => product.id),
  );
  const similarProducts = similarToSavedProducts.filter(
    (product) => !recommendedIds.has(product.id),
  );

  if (
    recommendedProducts.length < HOME_RAIL_MIN_PRODUCTS &&
    similarProducts.length < HOME_RAIL_MIN_PRODUCTS
  ) {
    return null;
  }

  const t = await getTranslations("home");

  return (
    <>
      {recommendedProducts.length >= HOME_RAIL_MIN_PRODUCTS ? (
        <ProductRecommendationRail
          title={t("recommendedForYou")}
          products={recommendedProducts}
          basePath={basePath}
          currency={currency}
          listId="recommendation-for-you"
          listName="Recommended for you"
          moreHref={`${basePath}/products`}
          variant="etsy"
          homeRailKey="recommended-for-you"
        />
      ) : null}
      {similarProducts.length >= HOME_RAIL_MIN_PRODUCTS ? (
        <ProductRecommendationRail
          title={t("similarToSaved")}
          products={similarProducts}
          basePath={basePath}
          currency={currency}
          listId="recommendation-similar-to-saved"
          listName="Similar to saved"
          moreHref={`${basePath}/account/favorites`}
          variant="etsy"
          homeRailKey="similar-to-saved"
        />
      ) : null}
    </>
  );
}
