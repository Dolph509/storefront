import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MerchandisingImpression } from "@/components/home/MerchandisingTracker";
import { ProductListing } from "@/components/products/ProductListing";
import type { SupportedLocale } from "@/i18n/locales";
import { getCollection, getCollectionProducts } from "@/lib/data/collections";
import { resolveCurrency } from "@/lib/data/markets";
import { getProductFilters } from "@/lib/data/products";
import { generateCollectionMetadata } from "@/lib/metadata/collection";
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

  const currency = await resolveCurrency(country);
  const listingState = parseListingSearchParams(rawSearchParams);
  const fetchCollectionProducts = getCollectionProducts.bind(
    null,
    collection.permalink,
  );
  const hero = collection.image_url || collection.mobile_image_url;

  return (
    <div>
      <MerchandisingImpression
        event="collection_view"
        payload={{ collection_id: collection.id }}
      />
      <div
        className="flex min-h-[280px] flex-col justify-end bg-gray-50 bg-cover bg-center"
        style={hero ? { backgroundImage: `url(${hero})` } : undefined}
      >
        <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">
            {collection.name}
          </h1>
          {collection.short_description ? (
            <p className="mt-3 max-w-2xl text-gray-700">
              {collection.short_description}
            </p>
          ) : null}
          {collection.description ? (
            <p className="mt-2 max-w-3xl text-gray-600">
              {collection.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="container mx-auto px-4 pt-4 sm:px-6 lg:px-8">
        <ProductListing
          state={listingState}
          basePath={basePath}
          currency={currency}
          locale={locale as SupportedLocale}
          listId={`collection-${collection.id}`}
          listName={`Collection: ${collection.name}`}
          fetchProducts={fetchCollectionProducts}
          fetchFilters={getProductFilters}
        />
      </div>
    </div>
  );
}
