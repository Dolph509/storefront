import type { Product, Seller } from "@spree/sdk";
import { ArrowUpRight, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ComponentProps } from "react";
import { MarketplacePage, MarketplaceSection } from "@/components/marketplace";
import { FeaturedShopFavoriteButton } from "@/components/shops/FeaturedShopFavoriteButton";
import {
  type ShopEditorialImage,
  ShopEditorialMedia,
} from "@/components/shops/ShopEditorialMedia";
import { StarSellerAvatar } from "@/components/shops/StarSellerAvatar";
import { CollectionTileCarousel } from "@/components/theme/CollectionTileCarousel";
import { buttonVariants } from "@/components/ui/button";
import { getSellerProducts } from "@/lib/data/sellers";
import { productDetailPathSegment } from "@/lib/discovery-context";
import { cn } from "@/lib/utils";

interface FeaturedShopsShowcaseProps {
  sellers: Seller[];
  basePath: string;
  locale: string;
  countryLabel?: string;
  title?: string;
  ctaHref?: string;
  ctaLabel?: string;
  carousel?: Omit<ComponentProps<typeof CollectionTileCarousel>, "items">;
}

function ShopEditorialCard({
  seller,
  basePath,
  locale,
  featuredProduct,
}: {
  seller: Seller;
  basePath: string;
  locale: string;
  featuredProduct?: Product;
}) {
  const shopHref = `${basePath}/sellers/${seller.slug}`;
  const rating = seller.average_rating;
  const price = featuredProduct?.price;
  const amount = price?.amount ? Number(price.amount) : NaN;
  const priceLabel =
    price?.currency && Number.isFinite(amount)
      ? new Intl.NumberFormat(locale, {
          style: "currency",
          currency: price.currency,
        }).format(amount)
      : price?.display_amount;
  const hasReviews = rating != null && (seller.reviews_count ?? 0) > 0;
  const images: ShopEditorialImage[] = [];
  if (featuredProduct?.thumbnail_url) {
    images.push({
      src: featuredProduct.thumbnail_url,
      kind: "product",
      href: `${basePath}/products/${productDetailPathSegment(featuredProduct)}`,
      label: featuredProduct.name,
      price: priceLabel || undefined,
    });
  }
  for (const [src, kind] of [
    [seller.cover_photo_url, "cover"],
    [seller.square_logo_url, "logo"],
    [seller.logo_url, "logo"],
  ] as const) {
    if (src && !images.some((image) => image.src === src)) {
      images.push({ src, kind, href: shopHref, label: seller.name });
    }
  }

  return (
    <article
      data-shop-editorial-card
      className="group relative h-full w-full min-w-0 snap-start overflow-hidden rounded-[var(--marketplace-radius-md)] border border-marketplace-border bg-marketplace-surface-elevated shadow-[var(--marketplace-shadow-card)] transition-[border-color,box-shadow] motion-reduce:transition-none hover:border-marketplace-brand/50 hover:shadow-[var(--marketplace-shadow-card-hover)]"
    >
      <ShopEditorialMedia
        key={JSON.stringify(images)}
        images={images}
        name={seller.name}
        shopHref={shopHref}
        className="aspect-[5/4] sm:aspect-[4/5]"
      />
      <FeaturedShopFavoriteButton sellerId={seller.id} shopPath={shopHref} />

      <div className="relative min-h-[4.75rem] px-3.5 py-3 pe-[4.5rem] sm:min-h-24 sm:px-4 sm:py-3.5 sm:pe-[5.4rem]">
        <div className="absolute -top-4 end-2.5 sm:-top-5 sm:end-3">
          <StarSellerAvatar
            seller={seller}
            sizeClassName="size-[3.5rem] rounded-full border-[3px] border-marketplace-surface-elevated bg-marketplace-surface-elevated shadow-sm sm:size-[4.35rem] sm:border-4"
            imageSizes="70px"
          />
        </div>
        <Link
          href={shopHref}
          className="block truncate font-display text-lg leading-tight text-marketplace-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketplace-brand sm:text-xl"
        >
          {seller.name}
        </Link>
        {seller.tagline ? (
          <p className="mt-0.5 line-clamp-1 text-[11px] leading-4 text-marketplace-muted-foreground sm:mt-1 sm:text-xs">
            {seller.tagline}
          </p>
        ) : null}
        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-4 text-marketplace-muted-foreground sm:mt-1.5 sm:text-xs">
          {hasReviews ? (
            <span className="inline-flex items-center gap-1 font-medium text-marketplace-foreground">
              <Star
                aria-hidden
                className="size-3.5 fill-[#d49132] text-[#d49132]"
              />
              {rating!.toFixed(1)}
              <span className="font-normal text-marketplace-muted-foreground">
                (
                {new Intl.NumberFormat(locale, { notation: "compact" }).format(
                  seller.reviews_count ?? 0,
                )}
                )
              </span>
            </span>
          ) : null}
          {seller.ships_from ? (
            <span className="inline-flex min-w-0 items-center gap-1 truncate">
              <MapPin aria-hidden className="size-3 shrink-0" />
              <span className="truncate">{seller.ships_from}</span>
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export async function FeaturedShopsShowcase({
  sellers,
  basePath,
  locale,
  countryLabel,
  title,
  ctaHref = `${basePath}/shops`,
  ctaLabel,
  carousel,
}: FeaturedShopsShowcaseProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  const displaySellers = carousel ? sellers : sellers.slice(0, 3);
  if (displaySellers.length === 0) return null;
  const productResults = await Promise.all(
    displaySellers.map(async (seller) => {
      try {
        const response = await getSellerProducts(seller.slug, {
          sellerId: seller.id,
          limit: 8,
          projection: "shop-card",
        });
        return response.data?.find(
          (product) => product.purchasable && product.thumbnail_url,
        );
      } catch {
        return undefined;
      }
    }),
  );

  const heading =
    title ??
    (countryLabel
      ? t("exploreShopsInCountry", { country: countryLabel })
      : t("exploreShops"));

  const cards = displaySellers.map((seller, index) => (
    <ShopEditorialCard
      key={seller.id}
      seller={seller}
      basePath={basePath}
      locale={locale}
      featuredProduct={productResults[index]}
    />
  ));
  const content = (
    <div
      className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[minmax(15rem,1fr)_minmax(0,3fr)] lg:items-end lg:gap-8"
      data-theme-section="featured_shops"
    >
      <header className="flex min-w-0 flex-col items-start max-md:gap-0 lg:pb-2">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-marketplace-brand-accent sm:mb-2 sm:text-[11px] sm:tracking-[0.16em]">
          {t("featuredShops")}
        </p>
        <div className="flex w-full min-w-0 items-end justify-between gap-3">
          <h2
            data-theme-section-heading
            className="max-w-[16ch] text-balance font-display text-[clamp(1.35rem,1.15rem+1vw,2.25rem)] font-normal leading-[1.12] tracking-[-0.02em] text-marketplace-foreground"
          >
            {heading}
          </h2>
          <Link
            href={ctaHref}
            className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-marketplace-brand sm:hidden"
          >
            {ctaLabel ?? t("viewAll")}
            <ArrowUpRight aria-hidden className="size-3.5" />
          </Link>
        </div>
        <p className="mt-1.5 max-w-[30ch] text-xs leading-relaxed text-marketplace-muted-foreground sm:mt-2.5 sm:text-sm">
          {t("shopsYoullLoveDescription")}
        </p>
        <Link
          href={ctaHref}
          className={cn(
            buttonVariants({ variant: "outline", size: "default" }),
            "mt-5 hidden min-h-11 rounded-[var(--marketplace-button-radius)] border-marketplace-brand bg-marketplace-surface px-5 text-sm font-medium text-marketplace-brand hover:bg-marketplace-brand hover:text-marketplace-brand-foreground sm:inline-flex",
          )}
        >
          {ctaLabel ?? t("viewAllShops")}
          <ArrowUpRight aria-hidden className="ml-1 size-4" />
        </Link>
      </header>

      {carousel ? (
        <CollectionTileCarousel {...carousel} items={cards} />
      ) : (
        <section
          className="-mx-[var(--marketplace-gutter,1rem)] flex min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-[var(--marketplace-gutter,1rem)] pb-1 scroll-smooth touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:auto-cols-auto sm:grid-cols-3 sm:grid-flow-row sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 sm:touch-auto"
          aria-label={t("featuredShops")}
        >
          {cards.map((card) => (
            <div
              key={card.key}
              className="w-[min(78vw,18.5rem)] shrink-0 snap-start sm:w-auto sm:shrink"
            >
              {card}
            </div>
          ))}
        </section>
      )}
    </div>
  );

  return carousel ? (
    content
  ) : (
    <MarketplaceSection
      surface="default"
      className="border-y border-marketplace-border-subtle"
    >
      <MarketplacePage>{content}</MarketplacePage>
    </MarketplaceSection>
  );
}
