import type {
  Category,
  Product,
  StoreMerchandisingPlacement,
} from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { CategoryQuickLinks } from "@/components/home/CategoryQuickLinks";
import { FeaturedCollectionsShowcase } from "@/components/home/FeaturedCollectionsShowcase";
import { HomeCuratedProductRail } from "@/components/home/HomeCuratedProductRail";
import { HomeEditorialBanners } from "@/components/home/HomeEditorialBanners";
import { HomeProductGrid } from "@/components/home/HomeProductGrid";
import { HomeServiceTrustBar } from "@/components/home/HomeServiceTrustBar";
import { MerchandisingImpression } from "@/components/home/MerchandisingTracker";
import { ShopByOccasionSection } from "@/components/home/ShopByOccasionSection";
import { MarketplacePage, MarketplaceSection } from "@/components/marketplace";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton";
import { getTrendingProducts } from "@/lib/data/recommendations";

function ProductGridSkeleton() {
  return (
    <MarketplaceSection>
      <MarketplacePage>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {[...Array(5)].map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </MarketplacePage>
    </MarketplaceSection>
  );
}

async function BestSellersSection({
  basePath,
  locale,
  currency,
  products: configuredProducts,
}: {
  basePath: string;
  locale: string;
  currency?: string;
  products: Product[];
}) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  const products = configuredProducts.length
    ? configuredProducts
    : await getTrendingProducts();
  if (!products.length) return null;

  return (
    <MarketplaceSection
      surface="none"
      className="bg-marketplace-background py-12 md:py-16"
    >
      <MarketplacePage className="max-w-[1360px] px-4 sm:px-6 lg:px-0">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold leading-none tracking-tight text-marketplace-brand md:text-[1.75rem]">
              {t("bestSellersTitle")}
            </h2>
            <p className="mt-1 text-xs text-marketplace-muted-foreground">
              {t("bestSellersDescription")}
            </p>
          </div>
          <Link
            href={`${basePath}/products`}
            className="shrink-0 text-xs font-semibold text-marketplace-brand hover:underline"
          >
            {t("viewAll")} →
          </Link>
        </div>
        <HomeProductGrid
          products={products}
          basePath={basePath}
          currency={currency}
          listId="home-best-sellers"
          listName="Best sellers"
          limit={5}
        />
      </MarketplacePage>
    </MarketplaceSection>
  );
}

interface HomeMarketplaceNarrativeProps {
  basePath: string;
  locale: string;
  country: string;
  currency?: string;
  placements: StoreMerchandisingPlacement[];
  rootCategories: Category[];
}

export async function HomeMarketplaceNarrative({
  basePath,
  locale,
  country,
  currency,
  placements,
  rootCategories,
}: HomeMarketplaceNarrativeProps) {
  const featuredPlacement = placements.find(
    (placement) =>
      (placement.kind === "product_rail" ||
        placement.kind === "featured_products" ||
        placement.kind === "featured_collection") &&
      placement.products.length > 0,
  );
  const occasionCategories =
    rootCategories.length > 4 ? rootCategories.slice(4, 12) : rootCategories;

  return (
    <>
      <CategoryQuickLinks
        categories={rootCategories}
        basePath={basePath}
        locale={locale}
      />

      <FeaturedCollectionsShowcase
        basePath={basePath}
        locale={locale}
        placements={placements}
        fallbackCategories={rootCategories}
      />

      {featuredPlacement ? (
        <MerchandisingImpression
          event="campaign_impression"
          payload={{
            campaign_id: featuredPlacement.campaign_id,
            placement_id: featuredPlacement.id,
            collection_id: featuredPlacement.collection_id,
          }}
        />
      ) : null}
      <Suspense fallback={<ProductGridSkeleton />}>
        <BestSellersSection
          basePath={basePath}
          locale={locale}
          currency={currency}
          products={featuredPlacement?.products ?? []}
        />
      </Suspense>

      <Suspense fallback={null}>
        <HomeCuratedProductRail
          basePath={basePath}
          locale={locale}
          currency={currency}
        />
      </Suspense>

      <HomeEditorialBanners basePath={basePath} locale={locale} />

      <ShopByOccasionSection
        categories={occasionCategories}
        basePath={basePath}
        locale={locale}
      />
      <HomeServiceTrustBar locale={locale} />
    </>
  );
}
