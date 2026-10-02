import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProductListing } from "@/components/products/ProductListing";
import { resolveCurrency } from "@/lib/data/markets";
import { getProductFilters, getProducts } from "@/lib/data/products";
import { generateProductsMetadata } from "@/lib/metadata/products";
import { parseListingSearchParams } from "@/lib/utils/listing-search-params";

interface ProductsPageProps {
  params: Promise<{
    country: string;
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: ProductsPageProps): Promise<Metadata> {
  const { country, locale } = await params;
  return generateProductsMetadata({ country, locale });
}

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const { country, locale } = await params;
  const rawSearchParams = await searchParams;
  const basePath = `/${country}/${locale}`;
  const currency = await resolveCurrency(country);

  const listingState = parseListingSearchParams(rawSearchParams);
  const query = listingState.query;

  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "products",
  });

  const listId = query ? "search-results" : "all-products";
  const listName = query ? "Search Results" : "All Products";

  return (
    <div className="mx-auto max-w-[var(--marketplace-container)] px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <header className="mb-8 border-b border-marketplace-border pb-6 md:mb-10 md:pb-8">
        {query ? (
          <h1 className="marketplace-listing-title text-balance text-marketplace-foreground">
            {t("searchResultsFor", { query })}
          </h1>
        ) : (
          <>
            <h1 className="marketplace-listing-title text-balance text-marketplace-foreground">
              {t("allProducts")}
            </h1>
            <p className="mt-2 max-w-2xl text-marketplace-muted-foreground">
              {t("browseCollection")}
            </p>
          </>
        )}
      </header>

      <ProductListing
        state={listingState}
        basePath={basePath}
        currency={currency}
        locale={locale as Locale}
        listId={listId}
        listName={listName}
        fetchProducts={getProducts}
        fetchFilters={getProductFilters}
        emptyMessage={
          query ? t("noMatchingProducts", { query }) : t("tryAdjustingFilters")
        }
      />
    </div>
  );
}
