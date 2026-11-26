import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MerchandisingImpression } from "@/components/home/MerchandisingTracker";
import { MarketplacePage, MarketplaceSection } from "@/components/marketplace";
import { DiscoveryRecommendationRail } from "@/components/products/DiscoveryRecommendationRail";
import { ProductListing } from "@/components/products/ProductListing";
import { ThemePageRenderer } from "@/components/theme/ThemePageRenderer";
import { CategoryImage } from "@/components/ui/category-image";
import type { SupportedLocale } from "@/i18n/locales";
import { getCollection, getCollectionProducts } from "@/lib/data/collections";
import { resolveCurrency } from "@/lib/data/markets";
import { getProductFilters } from "@/lib/data/products";
import { generateCollectionMetadata } from "@/lib/metadata/collection";
import { themeTemplateCollectionEnabled } from "@/lib/theme/flags";
import {
  getActiveTheme,
  getResolvedTemplate,
  themeGroupHasContent,
} from "@/lib/theme/resolver";
import { parseListingSearchParams } from "@/lib/utils/listing-search-params";

interface CollectionPageProps {
  params: Promise<{
    country: string;
    locale: string;
    slug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { country, locale, slug } = await params;
  return generateCollectionMetadata({ country, locale, slug });
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { country, locale, slug } = await params;
  const rawSearchParams = await searchParams;
  const basePath = `/${country}/${locale}`;

  let collection;
  try {
    collection = await getCollection(slug);
  } catch {
    notFound();
  }

  if (!collection) notFound();

  const [currency, theme] = await Promise.all([
    resolveCurrency(country),
    getActiveTheme().catch(() => null),
  ]);
  const t = await getTranslations({
    locale: locale as SupportedLocale,
    namespace: "products",
  });
  if (theme && themeTemplateCollectionEnabled()) {
    const template = await getResolvedTemplate({
      templateType: "collection",
      templateKey: "default",
      resourceType: "Spree::Collection",
      resourceId: collection.id,
    });
    if (template && themeGroupHasContent(template.data)) {
      return (
        <>
          <MerchandisingImpression
            event="collection_view"
            payload={{ collection_id: collection.id }}
          />
          <ThemePageRenderer
            theme={theme}
            template={template}
            context={{
              kind: "collection",
              collection,
              collectionId: collection.id,
              collectionName: collection.name,
              collectionSlug: collection.permalink,
              listingSearchParams: rawSearchParams,
              basePath,
              locale,
              country,
              currency,
            }}
          />
        </>
      );
    }
  }
  const listingState = parseListingSearchParams(rawSearchParams);
  const fetchCollectionProducts = getCollectionProducts.bind(
    null,
    collection.permalink,
  );
  const hero = collection.image_url || collection.mobile_image_url;

  return (
    <div data-theme-collection-page>
      <nav
        data-theme-collection-breadcrumbs
        aria-label="Breadcrumb"
        className="mx-auto flex max-w-[var(--marketplace-container)] items-center gap-2 px-4 py-2 text-xs text-marketplace-muted-foreground sm:px-6 sm:text-sm md:py-3 lg:px-8"
      >
        <Link
          href={`${basePath}/products`}
          className="hover:text-marketplace-brand hover:underline focus-visible:outline-2 focus-visible:outline-marketplace-brand"
        >
          {t("allProducts")}
        </Link>
        <span aria-hidden="true">/</span>
        <span
          aria-current="page"
          className="truncate text-marketplace-foreground"
        >
          {collection.name}
        </span>
      </nav>
      <MerchandisingImpression
        event="collection_view"
        payload={{ collection_id: collection.id }}
      />
      <MarketplaceSection
        data-theme-collection-banner
        surface="warm"
        className="py-0"
      >
        <div
          className={`mx-auto grid max-w-[var(--marketplace-container)] ${hero ? "md:grid-cols-[minmax(0,1fr)_minmax(0,42%)]" : ""}`}
        >
          <MarketplacePage className="order-2 flex min-w-0 flex-col justify-center py-5 md:order-1 md:py-10">
            <h1 className="marketplace-listing-title text-balance text-marketplace-foreground">
              {collection.name}
            </h1>
            {collection.short_description ? (
              <p className="mt-3 max-w-2xl text-marketplace-muted-foreground">
                {collection.short_description}
              </p>
            ) : null}
            {collection.description ? (
              <p className="mt-2 line-clamp-3 max-w-3xl text-sm text-marketplace-muted-foreground md:line-clamp-none">
                {collection.description}
              </p>
            ) : null}
          </MarketplacePage>
          {hero ? (
            <div
              aria-hidden="true"
              className="relative order-1 aspect-[5/3] overflow-hidden md:order-2 md:aspect-auto md:min-h-56"
            >
              <CategoryImage
                src={hero}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 42vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </MarketplaceSection>

      <MarketplacePage
        className="min-w-0 py-4 md:py-6"
        data-theme-discovery-listing
      >
        <ProductListing
          state={listingState}
          basePath={basePath}
          currency={currency}
          locale={locale as SupportedLocale}
          listId={`collection-${collection.id}`}
          listName={`Collection: ${collection.name}`}
          fetchProducts={fetchCollectionProducts}
          fetchFilters={getProductFilters}
          paginationStyle={
            theme?.settings?.collection_page?.pagination === "pages"
              ? "pages"
              : "load_more"
          }
          mobileColumns={2}
          cardDensity="discovery"
        />
      </MarketplacePage>

      <div data-theme-discovery-listing-rail className="max-md:hidden">
        <DiscoveryRecommendationRail
          context={{ surface: "collection" }}
          basePath={basePath}
          currency={currency}
          locale={locale}
          listId={`collection-discovery-${collection.id}`}
          dismissSurface={`collection:${collection.id}`}
        />
      </div>
    </div>
  );
}
