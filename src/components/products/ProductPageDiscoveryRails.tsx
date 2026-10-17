import type { Product } from "@spree/sdk";
import { getTranslations } from "next-intl/server";
import { ProductPdpDiscoveryBlock } from "@/components/products/ProductPdpDiscoveryBlock";
import { RecentlyViewedProducts } from "@/components/products/RecentlyViewedProducts";
import { fetchDiscoveryPlacements } from "@/lib/data/ads-placements";
import {
  getMoreFromShopProducts,
  getProductPageRecommendedProducts,
  getSimilarProducts,
} from "@/lib/data/recommendations";
import { primaryCategoryBrowseHref } from "@/lib/pdp/discovery-items";
import type { ProductPageDiscoverySkip } from "@/lib/theme/product-discovery-skip";
import { promiseWithTimeout } from "@/lib/utils/promise-with-timeout";

const RAIL_FETCH_TIMEOUT_MS = 5_000;
const DISCOVERY_RAIL_LIMIT = 8;

type ProductPageDiscoveryRailsProps = {
  product: Product;
  basePath: string;
  locale: string;
  currency?: string;
  skip?: ProductPageDiscoverySkip;
  productCount?: number;
};

function dedupeProducts(
  products: Product[],
  excludeId: string,
  seen: Set<string>,
  limit: number,
): Product[] {
  const result: Product[] = [];
  for (const item of products) {
    if (item.id === excludeId || seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
    if (result.length >= limit) break;
  }
  return result;
}

export async function ProductPageDiscoveryRails({
  product,
  basePath,
  locale,
  currency,
  skip = {},
  productCount = DISCOVERY_RAIL_LIMIT,
}: ProductPageDiscoveryRailsProps) {
  const productId = product.id;
  const fetchLimit = productCount + 2;
  const [t, shopProducts, similarProducts, recommended, sponsoredRows] =
    await Promise.all([
      getTranslations({ locale: locale as Locale, namespace: "products" }),
      skip.moreFromShop
        ? Promise.resolve([])
        : promiseWithTimeout(
            getMoreFromShopProducts(productId, undefined, fetchLimit),
            RAIL_FETCH_TIMEOUT_MS,
            [],
          ),
      skip.similar
        ? Promise.resolve([])
        : promiseWithTimeout(
            getSimilarProducts(productId, undefined, fetchLimit),
            RAIL_FETCH_TIMEOUT_MS,
            [],
          ),
      promiseWithTimeout(
        getProductPageRecommendedProducts(productId, fetchLimit),
        RAIL_FETCH_TIMEOUT_MS,
        { products: [], personalized: false },
      ),
      fetchDiscoveryPlacements({
        placement: "product_page_related",
        limit: 6,
        product_id: productId,
        currency,
      }),
    ]);

  const seen = new Set<string>([productId]);
  const similar = skip.similar
    ? []
    : dedupeProducts(similarProducts, productId, seen, productCount);
  const recommendedProducts = dedupeProducts(
    recommended.products,
    productId,
    seen,
    productCount,
  );
  const moreFromShop = dedupeProducts(
    shopProducts,
    productId,
    seen,
    productCount,
  );

  const includingAdsLabel =
    sponsoredRows.length > 0 ? t("pdpIncludingAds") : undefined;
  const categoryBrowseHref = primaryCategoryBrowseHref(product, basePath);

  const sellerName = product.seller?.name ?? product.seller_name ?? undefined;
  const shopTitle = sellerName
    ? t("moreFromShop", { shop: sellerName })
    : t("moreFromThisShop");
  const sellerSlug = product.seller?.slug;
  const visitShopHref = sellerSlug
    ? `${basePath}/sellers/${sellerSlug}`
    : undefined;

  return (
    <>
      {!skip.moreFromShop ? (
        <ProductPdpDiscoveryBlock
          sectionKey="more-from-shop"
          title={shopTitle}
          products={moreFromShop}
          basePath={basePath}
          currency={currency}
          listId="recommendation-shop"
          listName="More from shop"
          moreHref={visitShopHref}
          moreLabel={visitShopHref ? t("pdpVisitShop") : undefined}
        />
      ) : null}

      {(similar.length > 0 || sponsoredRows.length > 0) && (
        <ProductPdpDiscoveryBlock
          sectionKey="you-may-also-like"
          title={t("pdpYouMayAlsoLike")}
          includingAdsLabel={includingAdsLabel}
          products={similar}
          sponsoredRows={sponsoredRows}
          basePath={basePath}
          currency={currency}
          listId="recommendation-similar"
          listName="You may also like"
          moreHref={categoryBrowseHref}
          moreLabel={t("pdpSeeMore")}
          personalized
        />
      )}

      <ProductPdpDiscoveryBlock
        sectionKey="similar-taste"
        title={t("pdpSimilarTaste")}
        products={recommendedProducts}
        basePath={basePath}
        currency={currency}
        listId="recommendation-for-you"
        listName="Shoppers with similar taste loved these"
        moreHref={`${basePath}/products`}
        moreLabel={t("pdpShowMore")}
        personalized={recommended.personalized}
      />

      {!skip.recentlyViewed ? (
        <RecentlyViewedProducts
          productId={productId}
          basePath={basePath}
          currency={currency}
          heading={t("recentlyViewed")}
        />
      ) : null}
    </>
  );
}
