import type { StoreMerchandisingPlacement } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MerchandisingImpression } from "@/components/home/MerchandisingTracker";
import { ProductRecommendationRail } from "@/components/products/ProductRecommendationRail";
import { ShopCard } from "@/components/shops/ShopCard";
import { Button } from "@/components/ui/button";

function destinationHref(basePath: string, value?: string | null) {
  if (!value) return `${basePath}/products`;
  if (value.startsWith("http")) return value;
  return `${basePath}${value.startsWith("/") ? value : `/${value}`}`;
}

export async function MerchandisingProductRails({
  placements,
  basePath,
  currency,
}: {
  placements: StoreMerchandisingPlacement[];
  basePath: string;
  currency?: string;
}) {
  const rails = placements.filter(
    (placement) =>
      (placement.kind === "product_rail" ||
        placement.kind === "featured_products" ||
        placement.kind === "featured_collection") &&
      placement.products.length > 0,
  );

  return (
    <>
      {rails.map((placement) => (
        <div key={placement.id}>
          <MerchandisingImpression
            event="campaign_impression"
            payload={{
              campaign_id: placement.campaign_id,
              placement_id: placement.id,
              collection_id: placement.collection_id,
            }}
          />
          <ProductRecommendationRail
            title={
              placement.title ||
              placement.campaign_title ||
              placement.heading ||
              ""
            }
            products={placement.products}
            basePath={basePath}
            currency={currency}
            listId={`merchandising-${placement.id}`}
            listName={placement.title || placement.campaign_name}
            listDiscovery={{
              listId: `merchandising-${placement.id}`,
              listName: placement.title || placement.campaign_name,
              campaignId: placement.campaign_id ?? undefined,
              placementId: placement.id,
            }}
            moreHref={destinationHref(basePath, placement.cta_url)}
            moreLabel={placement.cta_label || undefined}
          />
        </div>
      ))}
    </>
  );
}

export async function MerchandisingShopRails({
  placements,
  basePath,
  locale,
}: {
  placements: StoreMerchandisingPlacement[];
  basePath: string;
  locale: string;
}) {
  const t = await getTranslations("home");
  const rails = placements.filter(
    (placement) =>
      placement.kind === "shop_rail" && placement.sellers.length > 0,
  );

  return (
    <>
      {rails.map((placement) => (
        <section
          key={placement.id}
          className="container mx-auto px-4 py-12 sm:px-6 lg:px-8"
        >
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {placement.title || t("featuredShops")}
            </h2>
          </div>
          <MerchandisingImpression
            event="campaign_impression"
            payload={{
              campaign_id: placement.campaign_id,
              placement_id: placement.id,
            }}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {placement.sellers.map((seller) => (
              <ShopCard
                key={seller.id}
                seller={seller}
                basePath={basePath}
                locale={locale}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

export async function MerchandisingCollectionTiles({
  placements,
  basePath,
}: {
  placements: StoreMerchandisingPlacement[];
  basePath: string;
}) {
  const t = await getTranslations("home");
  const tiles = placements.filter(
    (placement) =>
      placement.kind === "collection_tiles" && placement.collection,
  );
  if (!tiles.length) return null;

  return (
    <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-8 text-2xl font-bold text-gray-900">
        {t("giftGuides")}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((placement) => {
          const collection = placement.collection;
          if (!collection) return null;
          return (
            <Link
              key={placement.id}
              href={`${basePath}/collections/${collection.permalink}`}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              {collection.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={collection.image_url}
                  alt=""
                  className="aspect-[16/9] w-full object-cover"
                />
              ) : (
                <div className="aspect-[16/9] bg-gray-100" />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">
                  {collection.name}
                </h3>
                {collection.short_description ? (
                  <p className="mt-1 text-sm text-gray-600">
                    {collection.short_description}
                  </p>
                ) : null}
                <Button variant="link" className="mt-2 px-0">
                  {collection.cta_label || t("shopNow")}
                </Button>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
