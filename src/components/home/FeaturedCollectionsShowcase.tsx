import type { Category, StoreMerchandisingPlacement } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FeaturedCollectionCard } from "@/components/home/FeaturedCollectionCard";
import { getCollectionStockImage } from "@/lib/marketplace-stock-images";

interface FeaturedCollectionsShowcaseProps {
  basePath: string;
  locale: string;
  placements: StoreMerchandisingPlacement[];
  fallbackCategories: Category[];
}

export async function FeaturedCollectionsShowcase({
  basePath,
  locale,
  placements,
  fallbackCategories,
}: FeaturedCollectionsShowcaseProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  const tiles = placements.filter(
    (placement) =>
      placement.kind === "collection_tiles" && placement.collection,
  );

  const configuredCards =
    tiles.length > 0
      ? tiles.slice(0, 3).map((placement, index) => {
          const collection = placement.collection;
          if (!collection) return null;
          return {
            key: placement.id,
            href: `${basePath}/collections/${collection.permalink}`,
            title: collection.name,
            description: collection.description || placement.body,
            imageUrl:
              collection.image_url?.trim() ||
              getCollectionStockImage(index, collection.name),
            cta: collection.cta_label || t("shopCollection"),
          };
        })
      : fallbackCategories.slice(0, 3).map((category, index) => ({
          key: category.id,
          href: `${basePath}/c/${category.permalink}`,
          title: category.name,
          description: category.description,
          imageUrl:
            category.image_url?.trim() ||
            getCollectionStockImage(index, category.name),
          cta: t("shopCollection"),
        }));

  const resolvedConfigured = configuredCards.filter(Boolean) as Array<{
    key: string;
    href: string;
    title: string;
    description?: string | null;
    imageUrl: string;
    cta: string;
  }>;
  const resolved = resolvedConfigured.length
    ? resolvedConfigured
    : fallbackCategories.slice(0, 3).map((category, index) => ({
        key: category.id,
        href: `${basePath}/c/${category.permalink}`,
        title: category.name,
        description: category.description,
        imageUrl:
          category.image_url?.trim() ||
          getCollectionStockImage(index, category.name),
        cta: t("shopCollection"),
      }));

  if (!resolved.length) return null;

  return (
    <section className="bg-marketplace-background py-12 md:py-16">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-0">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
          <div className="shrink-0 lg:w-[10.5rem]">
            <h2 className="font-display text-2xl font-semibold leading-none tracking-tight text-marketplace-brand md:text-[2rem]">
              {t("featuredCollectionsTitle")}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-marketplace-muted-foreground md:text-sm">
              {t("featuredCollectionsDescription")}
            </p>
            <Link
              href={`${basePath}/products`}
              className="mt-3 inline-flex rounded-md border border-marketplace-brand bg-white px-4 py-2 text-xs font-semibold text-marketplace-brand transition hover:bg-marketplace-canvas"
            >
              {t("exploreAllCollections")}
            </Link>
          </div>
          <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {resolved.map((card) => (
              <FeaturedCollectionCard
                key={card.key}
                href={card.href}
                title={card.title}
                description={card.description}
                imageUrl={card.imageUrl}
                ctaLabel={card.cta}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
