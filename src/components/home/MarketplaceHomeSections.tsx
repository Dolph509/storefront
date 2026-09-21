import type { StoreMerchandisingPlacement } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import {
  MerchandisingCollectionTiles,
  MerchandisingProductRails,
  MerchandisingShopRails,
} from "@/components/home/MerchandisingRails";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton";
import { ProductCarousel } from "@/components/products/ProductCarousel";
import { ProductRecommendationRail } from "@/components/products/ProductRecommendationRail";
import { ShopCard } from "@/components/shops/ShopCard";
import { Button } from "@/components/ui/button";
import { PRODUCT_CARD_FIELDS } from "@/lib/data/cached";
import { cachedListProducts } from "@/lib/data/products";
import {
  getFollowedShopProducts,
  getNewArrivalProducts,
  getTrendingProducts,
} from "@/lib/data/recommendations";
import { getAccessToken, getClient } from "@/lib/spree";

function RailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

async function ProductRail({
  basePath,
  locale,
  country,
  currency,
  titleKey,
  sort,
}: {
  basePath: string;
  locale: string;
  country: string;
  currency?: string;
  titleKey: "customerFavorites" | "deals";
  sort: string;
}) {
  const t = await getTranslations("home");
  const userToken = await getAccessToken();
  const productsResponse = await cachedListProducts(
    { limit: 8, fields: PRODUCT_CARD_FIELDS, sort },
    { locale, country },
    "dtc",
    userToken,
  );

  if (!productsResponse.data?.length) return null;

  return (
    <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t(titleKey)}</h2>
        <Button variant="link" asChild>
          <Link href={`${basePath}/products`}>{t("viewAll")} →</Link>
        </Button>
      </div>
      <ProductCarousel
        products={productsResponse.data}
        basePath={basePath}
        currency={currency}
        listId={`home-${titleKey}`}
        listName={t(titleKey)}
      />
    </section>
  );
}

async function TrendingRail({
  basePath,
  locale,
  currency,
}: {
  basePath: string;
  locale: string;
  currency?: string;
}) {
  const t = await getTranslations("home");
  const products = await getTrendingProducts();
  return (
    <ProductRecommendationRail
      title={t("trendingNow")}
      products={products}
      basePath={basePath}
      currency={currency}
      listId="recommendation-trending"
      listName="Trending"
      moreHref={`${basePath}/products`}
    />
  );
}

async function NewArrivalsRail({
  basePath,
  locale,
  currency,
}: {
  basePath: string;
  locale: string;
  currency?: string;
}) {
  const t = await getTranslations("home");
  const products = await getNewArrivalProducts();
  return (
    <ProductRecommendationRail
      title={t("newAndNoteworthy")}
      products={products}
      basePath={basePath}
      currency={currency}
      listId="recommendation-new"
      listName="New arrivals"
      moreHref={`${basePath}/products`}
    />
  );
}

async function FollowedShopsRail({
  basePath,
  locale,
  currency,
}: {
  basePath: string;
  locale: string;
  currency?: string;
}) {
  const t = await getTranslations("home");
  const products = await getFollowedShopProducts();
  return (
    <ProductRecommendationRail
      title={t("newFromFollowedShops")}
      products={products}
      basePath={basePath}
      currency={currency}
      listId="recommendation-followed-shops"
      listName="From shops you follow"
      moreHref={`${basePath}/products`}
    />
  );
}

async function PopularShopsRail({
  basePath,
  locale,
}: {
  basePath: string;
  locale: string;
}) {
  const t = await getTranslations("home");

  let sellers;
  try {
    sellers = await getClient().sellers.list({
      limit: 4,
      sort: "-average_rating",
    });
  } catch {
    return null;
  }

  if (!sellers.data?.length) return null;

  const cards = await Promise.all(
    sellers.data.map(async (seller) => {
      let thumbs: Array<string | null> = [];
      try {
        const products = await getClient().products.list({
          seller_id_eq: seller.id,
          limit: 3,
          fields: ["thumbnail_url"],
        });
        thumbs = (products.data ?? []).map((product) => product.thumbnail_url);
      } catch {
        thumbs = [];
      }
      return (
        <ShopCard
          key={seller.id}
          seller={seller}
          basePath={basePath}
          locale={locale}
          productThumbs={thumbs}
        />
      );
    }),
  );

  return (
    <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("popularShops")}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards}
      </div>
    </section>
  );
}

interface MarketplaceHomeSectionsProps {
  basePath: string;
  locale: string;
  country: string;
  currency?: string;
  placements?: StoreMerchandisingPlacement[];
}

export async function MarketplaceHomeSections({
  basePath,
  locale,
  country,
  currency,
  placements = [],
}: MarketplaceHomeSectionsProps) {
  const hasProductRails = placements.some(
    (placement) =>
      placement.kind === "product_rail" && placement.products.length > 0,
  );
  const hasShopRails = placements.some(
    (placement) =>
      placement.kind === "shop_rail" && placement.sellers.length > 0,
  );

  return (
    <>
      <MerchandisingProductRails
        placements={placements}
        basePath={basePath}
        currency={currency}
      />
      <MerchandisingShopRails
        placements={placements}
        basePath={basePath}
        locale={locale}
      />
      <MerchandisingCollectionTiles
        placements={placements}
        basePath={basePath}
      />
      {hasProductRails ? null : (
        <Suspense fallback={<RailSkeleton />}>
          <TrendingRail
            basePath={basePath}
            locale={locale}
            currency={currency}
          />
        </Suspense>
      )}
      {hasShopRails ? null : (
        <Suspense fallback={null}>
          <PopularShopsRail basePath={basePath} locale={locale} />
        </Suspense>
      )}
      <Suspense fallback={<RailSkeleton />}>
        <ProductRail
          basePath={basePath}
          locale={locale}
          country={country}
          currency={currency}
          titleKey="customerFavorites"
          sort="-reviews_count"
        />
      </Suspense>
      {hasProductRails ? null : (
        <Suspense fallback={<RailSkeleton />}>
          <NewArrivalsRail
            basePath={basePath}
            locale={locale}
            currency={currency}
          />
        </Suspense>
      )}
      <Suspense fallback={null}>
        <FollowedShopsRail
          basePath={basePath}
          locale={locale}
          currency={currency}
        />
      </Suspense>
      <Suspense fallback={<RailSkeleton />}>
        <ProductRail
          basePath={basePath}
          locale={locale}
          country={country}
          currency={currency}
          titleKey="deals"
          sort="price"
        />
      </Suspense>
    </>
  );
}
