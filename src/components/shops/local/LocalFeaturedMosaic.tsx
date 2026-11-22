import type { Product, Seller } from "@spree/sdk";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { presentLocalShop } from "@/lib/shops/local-shop-presentation";
import { cn } from "@/lib/utils";

type MosaicShop = {
  seller: Seller;
  distanceMiles: number | null;
  presentationIndex?: number;
  locationLabel?: string | null;
  imageUrl?: string | null;
  featuredProduct?: Product;
};

function shopLocation(shop: MosaicShop): string | null {
  if (shop.locationLabel) return shop.locationLabel;
  const presentation = presentLocalShop(
    shop.seller,
    shop.presentationIndex ?? 0,
  );
  return presentation.locationCity || null;
}

interface LocalFeaturedMosaicProps {
  shops: MosaicShop[];
  basePath: string;
  locale: string;
  className?: string;
}

function Meta({
  name,
  location,
  rating,
  reviews,
}: {
  name: string;
  location: string | null;
  rating: number;
  reviews: number;
}) {
  return (
    <div className="space-y-1">
      <p className="font-display text-[1.05rem] leading-tight text-marketplace-foreground sm:text-lg">
        {name}
      </p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-marketplace-muted-foreground sm:text-sm">
        {location ? <span>{location}</span> : null}
        {location ? <span aria-hidden>·</span> : null}
        <span className="inline-flex items-center gap-1">
          <Star
            aria-hidden
            className="size-3.5 fill-[#d49132] text-[#d49132]"
          />
          {rating.toFixed(1)}
          <span>({reviews})</span>
        </span>
      </div>
    </div>
  );
}

export function LocalFeaturedMosaic({
  shops,
  basePath,
  className,
}: LocalFeaturedMosaicProps) {
  const [primary, ...rest] = shops;
  if (!primary) return null;
  const secondary = rest.slice(0, 2);
  const primaryPresentation = presentLocalShop(
    primary.seller,
    primary.presentationIndex ?? 0,
  );
  const primaryLocation = shopLocation(primary);

  return (
    <div
      className={cn(
        "grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,1fr)] lg:gap-5",
        className,
      )}
    >
      <Link
        href={`${basePath}/sellers/${primary.seller.slug}`}
        className="group relative aspect-[4/3] min-h-[18rem] overflow-hidden rounded-[1.35rem] bg-[#ebe6df] sm:min-h-[22rem] lg:aspect-auto lg:min-h-[26rem]"
      >
        <Image
          src={primaryPresentation.heroImage}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(min-width: 1024px) 58vw, 100vw"
          priority
        />
        <span className="absolute inset-0 bg-gradient-to-t from-[#312b36]/80 via-[#312b36]/20 to-transparent" />
        <span className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
          <span className="block font-display text-2xl leading-tight sm:text-[1.75rem]">
            {primaryPresentation.displayName}
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-2 text-sm text-white/90">
            {primaryLocation ? <span>{primaryLocation}</span> : null}
            {primaryLocation ? <span aria-hidden>·</span> : null}
            <span className="inline-flex items-center gap-1">
              <Star
                aria-hidden
                className="size-3.5 fill-[#f3cc3e] text-[#f3cc3e]"
              />
              {primaryPresentation.averageRating.toFixed(1)} (
              {primaryPresentation.reviewsCount})
            </span>
          </span>
        </span>
      </Link>

      <div className="grid gap-4">
        {secondary.map((shop) => {
          const presentation = presentLocalShop(
            shop.seller,
            shop.presentationIndex ?? 0,
          );
          return (
            <Link
              key={shop.seller.id}
              href={`${basePath}/sellers/${shop.seller.slug}`}
              className="group grid min-h-[12.5rem] grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] overflow-hidden rounded-[1.25rem] border border-[#ebe4da] bg-white shadow-[0_2px_12px_rgba(49,43,54,0.04)]"
            >
              <span className="relative min-h-[12.5rem] bg-[#ebe6df]">
                <Image
                  src={presentation.heroImage}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="280px"
                />
              </span>
              <span className="flex items-center p-4 sm:p-5">
                <Meta
                  name={presentation.displayName}
                  location={shopLocation(shop)}
                  rating={presentation.averageRating}
                  reviews={presentation.reviewsCount}
                />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
