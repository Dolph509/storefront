import type { Product, Seller } from "@spree/sdk";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FeaturedShopFavoriteButton } from "@/components/shops/FeaturedShopFavoriteButton";
import { productDetailPathSegment } from "@/lib/discovery-context";
import {
  type LocalShopPresentation,
  presentLocalShop,
} from "@/lib/shops/local-shop-presentation";
import { cn } from "@/lib/utils";

interface LocalDiscoverShopCardProps {
  record: {
    seller: Seller;
    distanceMiles: number | null;
    presentationIndex?: number;
    locationLabel?: string | null;
  };
  products: Product[];
  basePath: string;
  locale: string;
  className?: string;
}

function Avatar({
  presentation,
  href,
}: {
  presentation: LocalShopPresentation;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[#ece4dc] font-display text-sm text-marketplace-foreground ring-1 ring-[#e4ddd2]"
      aria-label={presentation.displayName}
    >
      {presentation.avatarInitials}
    </Link>
  );
}

export function LocalDiscoverShopCard({
  record,
  products,
  basePath,
  className,
}: LocalDiscoverShopCardProps) {
  const { seller } = record;
  const shopHref = `${basePath}/sellers/${seller.slug}`;
  const presentation = presentLocalShop(seller, record.presentationIndex ?? 0);
  const hero = presentation.heroImage;
  const thumbs = presentation.thumbImages;
  const location = record.locationLabel || null;

  return (
    <article
      className={cn(
        "overflow-hidden rounded-[1.25rem] border border-[#ebe4da] bg-white shadow-[0_2px_14px_rgba(49,43,54,0.045)]",
        className,
      )}
    >
      <div className="relative">
        <Link
          href={shopHref}
          className="relative block aspect-[5/3.4] overflow-hidden bg-[#ebe6df]"
        >
          <Image
            src={hero}
            alt=""
            fill
            className="object-cover transition-transform duration-500 hover:scale-[1.02]"
            sizes="(min-width: 1280px) 24vw, (min-width: 768px) 40vw, 90vw"
          />
        </Link>
        <FeaturedShopFavoriteButton sellerId={seller.id} shopPath={shopHref} />
      </div>

      <div className="grid grid-cols-2 gap-2 p-2">
        {thumbs.map((src, index) => {
          const product = products[index];
          const href = product
            ? `${basePath}/products/${productDetailPathSegment(product)}`
            : shopHref;
          return (
            <Link
              key={`${seller.id}-thumb-${index}`}
              href={href}
              className="relative aspect-[5/4] overflow-hidden rounded-[0.75rem] bg-[#ebe6df]"
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="180px"
              />
            </Link>
          );
        })}
      </div>

      <div className="flex items-start gap-3 px-3.5 pb-4 pt-2.5">
        <Avatar presentation={presentation} href={shopHref} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[1.15rem] leading-tight text-marketplace-foreground">
            <Link href={shopHref} className="hover:underline">
              {presentation.displayName}
            </Link>
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.8rem] text-marketplace-muted-foreground">
            {location ? <span>{location}</span> : null}
            {location ? <span aria-hidden>·</span> : null}
            <span className="inline-flex items-center gap-1">
              <Star
                aria-hidden
                className="size-3.5 fill-[#d49132] text-[#d49132]"
              />
              {presentation.averageRating.toFixed(1)} (
              {presentation.reviewsCount})
            </span>
            <span aria-hidden>·</span>
            <span className="truncate">{presentation.categoryLabel}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
