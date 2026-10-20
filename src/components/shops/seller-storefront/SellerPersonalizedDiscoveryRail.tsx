import { getTranslations } from "next-intl/server";
import { ProductRecommendationRail } from "@/components/products/ProductRecommendationRail";
import { getSellerShopDiscoveryProducts } from "@/lib/data/recommendations";
import { sellerShopShellClass } from "@/lib/utils/seller-storefront";

export async function SellerPersonalizedDiscoveryRail({
  sellerId,
  slug,
  basePath,
  locale,
  excludeProductIds = [],
}: {
  sellerId: string;
  slug: string;
  basePath: string;
  locale: string;
  excludeProductIds?: string[];
}) {
  const { products, personalized } = await getSellerShopDiscoveryProducts(
    sellerId,
    slug,
    excludeProductIds,
  );
  if (!products.length) return null;

  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "sellers",
  });

  return (
    <div className="border-t border-[#e3ddd8] bg-white py-7">
      <div className={sellerShopShellClass}>
        <ProductRecommendationRail
          title={t("personalizedDiscoveryTitle")}
          products={products}
          basePath={basePath}
          listId={`seller-discovery-${slug}`}
          listName={t("personalizedDiscoveryTitle")}
          variant="etsy"
          dismissSurface={`seller_shop:${slug}:discovery`}
          analyticsSurface="seller_shop"
          personalized={personalized}
          suppressRelevanceReason
        />
      </div>
    </div>
  );
}
