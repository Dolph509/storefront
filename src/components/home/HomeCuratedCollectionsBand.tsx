import type { Collection } from "@spree/sdk";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  MarketplacePage,
  MarketplaceSection,
  MarketplaceSectionHeader,
} from "@/components/marketplace";
import { getCollections } from "@/lib/data/collections";
import { resolveCatalogImageUrl } from "@/lib/marketplace-stock-images";

interface HomeCuratedCollectionsBandProps {
  basePath: string;
  locale: string;
}

const FALLBACK_COLLECTION_IMAGES = [
  "/marketplace/category-personalized.png",
  "/marketplace/category-wedding.png",
  "/marketplace/category-home.png",
  "/marketplace/category-jewelry.png",
];

function collectionImage(collection: Collection, index: number): string {
  const image =
    (collection as Collection & { image_url?: string | null }).image_url ||
    (collection as Collection & { banner_url?: string | null }).banner_url;
  if (image) return resolveCatalogImageUrl(image, index);
  return FALLBACK_COLLECTION_IMAGES[index % FALLBACK_COLLECTION_IMAGES.length];
}

export async function HomeCuratedCollectionsBand({
  basePath,
  locale,
}: HomeCuratedCollectionsBandProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  let collections: Collection[] = [];
  try {
    const response = await getCollections({ limit: 6 });
    collections = response.data ?? [];
  } catch {
    collections = [];
  }

  const featured = collections.slice(0, 3);
  const occasionPills =
    collections.length > 0
      ? collections.slice(0, 6).map((collection) => ({
          id: collection.id,
          label: collection.name,
          href: `${basePath}/collections/${collection.permalink || collection.id}`,
        }))
      : [
          {
            id: "personalized",
            label: t("trustPersonalizedTitle"),
            href: `${basePath}/products?q=personalized`,
          },
          {
            id: "gifts",
            label: t("giftGuides"),
            href: `${basePath}/products?q=gift`,
          },
          {
            id: "handmade",
            label: t("serviceTrustHandmadeTitle"),
            href: `${basePath}/products`,
          },
          {
            id: "shops",
            label: t("featuredShops"),
            href: `${basePath}/shops`,
          },
        ];

  return (
    <MarketplaceSection
      surface="default"
      className="border-y border-marketplace-border-subtle py-6 md:py-14"
      data-theme-section="curated_collections"
    >
      <MarketplacePage>
        <MarketplaceSectionHeader
          eyebrow={t("featuredCollectionsDescription")}
          title={t("featuredCollectionsTitle")}
          density="home"
          className="max-md:mb-3 max-md:border-0 max-md:pb-0"
          action={
            <Link
              href={`${basePath}/products`}
              className="group inline-flex items-center gap-1 text-sm font-medium text-marketplace-brand transition-colors hover:text-marketplace-brand-accent"
            >
              <span className="max-md:hidden">
                {t("exploreAllCollections")}
              </span>
              <span className="md:hidden">{t("viewAll")}</span>
              <ArrowRight
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          }
        />

        {featured.length > 0 ? (
          <>
            {/* Mobile: compact horizontal collection cards */}
            <ul className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden">
              {featured.map((collection, index) => (
                <li
                  key={collection.id}
                  className="w-[78%] shrink-0 snap-start first:ms-0"
                >
                  <Link
                    href={`${basePath}/collections/${collection.permalink || collection.id}`}
                    className="group flex flex-col overflow-hidden rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-[#faf8f5]"
                  >
                    <div className="relative aspect-[5/3] overflow-hidden bg-marketplace-surface-subtle">
                      <Image
                        src={collectionImage(collection, index)}
                        alt={collection.name}
                        fill
                        className="object-cover"
                        sizes="78vw"
                      />
                    </div>
                    <div className="flex items-end justify-between gap-3 bg-[#faf8f5] p-4">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-marketplace-brand-accent">
                          {t("giftGuides")}
                        </p>
                        <h3 className="mt-1 truncate font-display text-lg font-normal leading-tight text-marketplace-foreground">
                          {collection.name}
                        </h3>
                      </div>
                      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-marketplace-border bg-marketplace-surface-elevated text-marketplace-brand">
                        <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop / tablet: editorial feature + paired cards */}
            <div className="hidden gap-4 md:grid lg:grid-cols-12 lg:gap-5">
              {featured[0] ? (
                <Link
                  href={`${basePath}/collections/${featured[0].permalink || featured[0].id}`}
                  className="group flex min-h-[20rem] flex-col overflow-hidden rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-[#faf8f5] lg:col-span-7 lg:min-h-[26rem]"
                >
                  <div className="relative min-h-0 flex-1 overflow-hidden bg-marketplace-surface-subtle">
                    <Image
                      src={collectionImage(featured[0], 0)}
                      alt={featured[0].name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                      sizes="(min-width: 1024px) 56vw, 100vw"
                    />
                  </div>
                  <div className="relative flex w-full items-end justify-between gap-4 bg-[#faf8f5] p-6 sm:p-7">
                    <div className="max-w-md">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-marketplace-brand-accent">
                        {t("featuredCollectionsDescription")}
                      </p>
                      <h3 className="mt-1.5 font-display text-2xl font-normal leading-tight text-marketplace-foreground sm:text-3xl">
                        {featured[0].name}
                      </h3>
                      {featured[0].description ? (
                        <p className="mt-2 line-clamp-2 text-sm text-marketplace-muted-foreground">
                          {featured[0].description}
                        </p>
                      ) : null}
                    </div>
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-marketplace-border bg-marketplace-surface-elevated text-marketplace-brand transition-colors group-hover:border-marketplace-brand group-hover:bg-marketplace-brand group-hover:text-marketplace-brand-foreground">
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
                {featured.slice(1, 3).map((collection, idx) => (
                  <Link
                    key={collection.id}
                    href={`${basePath}/collections/${collection.permalink || collection.id}`}
                    className="group grid overflow-hidden rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface-elevated transition-colors hover:border-marketplace-brand sm:grid-cols-[44%_56%]"
                  >
                    <div className="relative min-h-[10.5rem] bg-marketplace-surface-subtle">
                      <Image
                        src={collectionImage(collection, idx + 1)}
                        alt={collection.name}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
                        sizes="(min-width: 1024px) 18vw, 50vw"
                      />
                    </div>
                    <div className="flex flex-col justify-between p-5">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-marketplace-brand-accent">
                          {t("giftGuides")}
                        </p>
                        <h3 className="mt-1.5 font-display text-xl font-normal leading-snug text-marketplace-foreground transition-colors group-hover:text-marketplace-brand-accent">
                          {collection.name}
                        </h3>
                        {collection.description ? (
                          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-marketplace-muted-foreground">
                            {collection.description}
                          </p>
                        ) : null}
                      </div>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-marketplace-brand">
                        {t("shopCollection")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : null}

        <div className="mt-5 border-t border-marketplace-border-subtle pt-4 md:mt-8 md:pt-6">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-base font-normal text-marketplace-foreground md:text-lg">
                {t("shopByOccasionTitle")}
              </h3>
              <p className="hidden text-xs text-marketplace-muted-foreground sm:block">
                {t("shopByOccasionDescription")}
              </p>
            </div>
            <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              {occasionPills.map((item) => (
                <li key={item.id} className="shrink-0">
                  <Link
                    href={item.href}
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-[var(--marketplace-radius-sm)] border border-marketplace-border bg-marketplace-canvas px-3 py-1.5 text-xs font-medium text-marketplace-foreground transition-colors hover:border-marketplace-brand hover:bg-marketplace-brand hover:text-marketplace-brand-foreground sm:min-h-9 sm:px-3.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </MarketplacePage>
    </MarketplaceSection>
  );
}
