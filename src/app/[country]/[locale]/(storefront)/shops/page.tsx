import type { Product, Seller } from "@spree/sdk";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import {
  MarketplaceEmptyState,
  MarketplacePage,
  MarketplaceSection,
} from "@/components/marketplace";
import { LocalDiscoverShopCard } from "@/components/shops/local/LocalDiscoverShopCard";
import { LocalFeaturedMosaic } from "@/components/shops/local/LocalFeaturedMosaic";
import { LocalMadeCloseProductCard } from "@/components/shops/local/LocalMadeCloseProductCard";
import { LocalMakersCta } from "@/components/shops/local/LocalMakersCta";
import { LocalShopsCategoryPills } from "@/components/shops/local/LocalShopsCategoryPills";
import { LocalShopsFinder } from "@/components/shops/local/LocalShopsFinder";
import { LocalShopsSortControl } from "@/components/shops/local/LocalShopsSortControl";
import { ShopDirectorySearch } from "@/components/shops/ShopDirectorySearch";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/data/products";
import { listSellers } from "@/lib/data/sellers";
import { generateShopsMetadata } from "@/lib/metadata/shops";
import { loadShopPreviewProducts } from "@/lib/shops/local-directory";
import {
  buildLocalShopRecords,
  type LocalShopRecord,
  parseLocalCategory,
  parseLocalRadius,
  parseLocalSort,
  shortCityLabel,
} from "@/lib/shops/local-marketplace";
import { formatCityStateLabel } from "@/lib/shops/location-label";
import { resolveVisitorLocation } from "@/lib/shops/visitor-location";

interface ShopsPageProps {
  params: Promise<{ country: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: ShopsPageProps): Promise<Metadata> {
  const { country, locale } = await params;
  return generateShopsMetadata({ country, locale });
}

function readQuery(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? "";
}

function uniqueSellers(sellers: Seller[]): Seller[] {
  const seen = new Set<string>();
  return sellers.filter((seller) => {
    if (seen.has(seller.id)) return false;
    seen.add(seller.id);
    return true;
  });
}

function buildFallbackBuyerLabel(location: {
  city: string | null;
  region: string | null;
  label: string;
}): string {
  if (location.city && location.region) {
    return `${location.city}, ${location.region}`;
  }
  return location.label;
}

export default async function ShopsPage({
  params,
  searchParams,
}: ShopsPageProps) {
  const { country, locale } = await params;
  const resolved = await searchParams;
  const basePath = `/${country}/${locale}`;
  const query = readQuery(resolved.q);
  const near = readQuery(resolved.near);
  const radiusMiles = parseLocalRadius(readQuery(resolved.radius));
  const category = parseLocalCategory(readQuery(resolved.category));
  const sort = parseLocalSort(readQuery(resolved.sort));
  const showAllShops = readQuery(resolved.view) === "all";
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "shops",
  });
  const tNav = await getTranslations({
    locale: locale as Locale,
    namespace: "navigation",
  });

  const visitorLocation = await resolveVisitorLocation({
    country,
    near: near || null,
  });
  const buyerLocationLabel =
    formatCityStateLabel(visitorLocation.label) ||
    buildFallbackBuyerLabel(visitorLocation);
  const cityLabel = shortCityLabel(buyerLocationLabel);

  const [sellersResponse, productsResponse] = await Promise.all([
    listSellers({
      page: 1,
      limit: 48,
      sort: "-average_rating",
      q: query || undefined,
    }).catch(() => null),
    getProducts({ page: 1, limit: 24, expand: ["seller"] }).catch(() => null),
  ]);

  const allSellers = uniqueSellers(sellersResponse?.data ?? []);
  const localRecords = buildLocalShopRecords(
    allSellers,
    visitorLocation,
    radiusMiles,
    category,
    sort,
  );
  const featuredRecords = localRecords.slice(0, 3);
  const featuredIds = new Set(
    featuredRecords.map((record) => record.seller.id),
  );
  const discoverPool = localRecords.filter(
    (record) => !featuredIds.has(record.seller.id),
  );
  const discoverRecords = showAllShops
    ? discoverPool
    : discoverPool.slice(0, 8);
  const usedLocalFallback = !localRecords.some((record) => record.isLocalMatch);

  const productPool = (productsResponse?.data ?? []) as Product[];
  const localSellerIds = new Set(
    localRecords
      .filter((record) => record.isLocalMatch)
      .map((record) => record.seller.id),
  );
  const closeProducts = productPool
    .filter((product) => {
      const sellerId = product.seller_id || product.seller?.id;
      return sellerId ? localSellerIds.has(sellerId) : false;
    })
    .slice(0, 10);
  const madeCloseProducts =
    closeProducts.length > 0 ? closeProducts : productPool.slice(0, 10);

  async function withPreview(record: LocalShopRecord) {
    const preview = await loadShopPreviewProducts(record.seller, 3);
    return { record, products: preview.products };
  }

  const [featuredPreviews, discoverPreviews] = await Promise.all([
    Promise.all(
      featuredRecords.map(async (record) => {
        const preview = await loadShopPreviewProducts(record.seller, 1);
        return {
          ...record,
          featuredProduct: preview.products[0],
          imageUrl:
            preview.products[0]?.thumbnail_url || record.seller.cover_photo_url,
        };
      }),
    ),
    Promise.all(discoverRecords.map((record) => withPreview(record))),
  ]);

  return (
    <MarketplaceSection
      surface="none"
      className="bg-[#faf8f5] py-6 md:py-10"
      data-theme-section="shops_directory"
    >
      <MarketplacePage className="space-y-10 md:space-y-14">
        <div className="space-y-6 md:space-y-7">
          <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(12rem,0.8fr)] lg:gap-8">
            <div className="space-y-5">
              <nav aria-label={tNav("breadcrumb")} className="text-sm">
                <ol className="flex flex-wrap items-center gap-1 text-marketplace-muted-foreground">
                  <li>
                    <Link
                      href={basePath}
                      className="hover:text-marketplace-foreground"
                    >
                      {tNav("home")}
                    </Link>
                  </li>
                  <li aria-hidden>
                    <ChevronRight className="size-3.5" />
                  </li>
                  <li
                    className="text-marketplace-foreground"
                    aria-current="page"
                  >
                    {t("localTitle")}
                  </li>
                </ol>
              </nav>

              <header className="max-w-xl">
                <h1 className="font-display text-[clamp(2.15rem,1.6rem+2.2vw,3.35rem)] font-normal leading-[1.08] tracking-[-0.03em] text-marketplace-foreground">
                  {t("heroTitle")}
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-marketplace-muted-foreground sm:text-base">
                  {t("heroDescription")}
                </p>
              </header>
            </div>

            <div
              className="relative mx-auto w-full max-w-[18rem] lg:max-w-[22rem] lg:justify-self-end"
              aria-hidden
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/marketplace/local-shops-hero.png"
                alt=""
                width={630}
                height={288}
                className="h-auto w-full"
              />
            </div>
          </div>

          <Suspense fallback={null}>
            <LocalShopsFinder
              locationLabel={buyerLocationLabel}
              radiusMiles={radiusMiles}
              className="relative z-10 lg:-mt-2"
            />
          </Suspense>

          <Suspense fallback={null}>
            <LocalShopsCategoryPills
              activeCategory={category}
              radiusMiles={radiusMiles}
              activeSort={sort}
            />
          </Suspense>
        </div>

        <section
          className="space-y-4"
          aria-labelledby="independent-shops-heading"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="independent-shops-heading"
                className="font-display text-[clamp(1.35rem,1.15rem+0.8vw,1.85rem)] font-normal tracking-[-0.02em] text-marketplace-foreground"
              >
                {t("independentNearTitle", { location: cityLabel })}
              </h2>
              <p className="mt-1 text-sm text-marketplace-muted-foreground">
                {usedLocalFallback
                  ? t("independentNearFallback", {
                      count: localRecords.length,
                      location: cityLabel,
                    })
                  : t("independentNearMeta", {
                      count: localRecords.length,
                      miles: radiusMiles,
                    })}
              </p>
            </div>
            <Suspense fallback={null}>
              <LocalShopsSortControl activeSort={sort} />
            </Suspense>
          </div>

          {featuredPreviews.length > 0 ? (
            <LocalFeaturedMosaic
              shops={featuredPreviews}
              basePath={basePath}
              locale={locale}
            />
          ) : (
            <MarketplaceEmptyState
              illustration="no-listings-yet"
              title={t("emptyTitle")}
              description={t("emptyDescription")}
              action={
                <Button asChild>
                  <Link href={`${basePath}/products`}>
                    {t("browseProducts")}
                  </Link>
                </Button>
              }
            />
          )}
        </section>

        {discoverPreviews.length > 0 ? (
          <section
            id="discover-more"
            className="space-y-5"
            aria-labelledby="discover-more-heading"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h2
                id="discover-more-heading"
                className="font-display text-[clamp(1.35rem,1.15rem+0.8vw,1.85rem)] font-normal tracking-[-0.02em] text-marketplace-foreground"
              >
                {t("discoverMoreTitle")}
              </h2>
              <div className="flex w-full flex-col items-stretch gap-1.5 sm:w-auto sm:max-w-xl sm:items-end">
                <Suspense fallback={null}>
                  <ShopDirectorySearch initialQuery={query} />
                </Suspense>
                {!showAllShops &&
                discoverPool.length > discoverRecords.length ? (
                  <Link
                    href={(() => {
                      const params = new URLSearchParams();
                      if (buyerLocationLabel) {
                        params.set("near", buyerLocationLabel);
                      }
                      params.set("radius", String(radiusMiles));
                      params.set("view", "all");
                      if (sort && sort !== "nearest") params.set("sort", sort);
                      return `${basePath}/shops?${params.toString()}#discover-more`;
                    })()}
                    className="self-start text-sm font-medium text-marketplace-brand underline-offset-4 hover:underline sm:self-end"
                  >
                    {t("viewAll")}
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {discoverPreviews.map(({ record, products }) => (
                <LocalDiscoverShopCard
                  key={record.seller.id}
                  record={record}
                  products={products}
                  basePath={basePath}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        ) : null}

        {madeCloseProducts.length > 0 ? (
          <section className="space-y-5" aria-labelledby="made-close-heading">
            <h2
              id="made-close-heading"
              className="font-display text-[clamp(1.35rem,1.15rem+0.8vw,1.85rem)] font-normal tracking-[-0.02em] text-marketplace-foreground"
            >
              {t("madeCloseTitle")}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {madeCloseProducts.map((product) => (
                <LocalMadeCloseProductCard
                  key={product.id}
                  product={product}
                  basePath={basePath}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        ) : null}

        <LocalMakersCta basePath={basePath} locale={locale} />
      </MarketplacePage>
    </MarketplaceSection>
  );
}
