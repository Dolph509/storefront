import { getTranslations } from "next-intl/server";
import { ProductRecommendationRail } from "@/components/products/ProductRecommendationRail";
import {
  getMoreFromShopProducts,
  getSimilarProducts,
} from "@/lib/data/recommendations";

interface ProductPageRecommendationsProps {
  productId: string;
  sellerName?: string | null;
  basePath: string;
  currency?: string;
  locale: string;
}

export async function ProductPageRecommendations({
  productId,
  sellerName,
  basePath,
  currency,
  locale,
}: ProductPageRecommendationsProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "products",
  });

  const [shopProducts, similarProducts] = await Promise.all([
    getMoreFromShopProducts(productId),
    getSimilarProducts(productId),
  ]);

  const moreFromShop = shopProducts.filter((p) => p.id !== productId);
  const similar = similarProducts.filter((p) => p.id !== productId);

  const shopTitle = sellerName
    ? t("moreFromShop", { shop: sellerName })
    : t("moreFromThisShop");

  return (
    <>
      <ProductRecommendationRail
        title={shopTitle}
        products={moreFromShop}
        basePath={basePath}
        currency={currency}
        listId="recommendation-shop"
        listName="More from shop"
      />
      <ProductRecommendationRail
        title={t("youMayAlsoLike")}
        products={similar}
        basePath={basePath}
        currency={currency}
        listId="recommendation-similar"
        listName="You may also like"
      />
    </>
  );
}
