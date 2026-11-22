import type { Seller } from "@spree/sdk";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { StarRatingDisplay } from "@/components/reviews/StarRating";
import { FollowShopButton } from "@/components/shops/FollowShopButton";
import { shopCategoryLabel } from "@/lib/shops/local-directory";
import { cn } from "@/lib/utils";

interface LocalShopDirectoryCardProps {
  seller: Seller;
  basePath: string;
  locale: string;
  previewImageUrl?: string | null;
  className?: string;
}

export async function LocalShopDirectoryCard({
  seller,
  basePath,
  locale,
  previewImageUrl,
  className,
}: LocalShopDirectoryCardProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "shops",
  });
  const shopHref = `${basePath}/sellers/${seller.slug}`;
  const thumb =
    previewImageUrl ||
    seller.square_logo_url ||
    seller.logo_url ||
    seller.cover_photo_url ||
    "";
  const hasReviews =
    seller.average_rating != null && (seller.reviews_count ?? 0) > 0;
  const category = shopCategoryLabel(seller);

  return (
    <article
      className={cn(
        "flex items-center gap-3 rounded-[1rem] border border-[#e7e1d8] bg-white p-3 shadow-[0_1px_2px_rgba(49,43,54,0.03)] sm:gap-4 sm:p-3.5",
        className,
      )}
    >
      <Link
        href={shopHref}
        className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-[0.7rem] bg-[#ebe6df] sm:size-[5.25rem]"
      >
        {thumb ? (
          <Image
            src={thumb}
            alt=""
            fill
            className="object-cover"
            sizes="84px"
          />
        ) : (
          <span
            className="flex size-full items-center justify-center font-display text-2xl text-marketplace-brand"
            aria-hidden
          >
            {seller.name.slice(0, 1)}
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[0.95rem] font-semibold leading-tight text-marketplace-foreground sm:text-base">
          <Link
            href={shopHref}
            className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketplace-brand"
          >
            {seller.name}
          </Link>
        </h3>
        {hasReviews ? (
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-marketplace-muted-foreground">
            <span className="font-medium text-marketplace-foreground">
              {seller.average_rating!.toFixed(1)}
            </span>
            <StarRatingDisplay
              rating={seller.average_rating!}
              size="xs"
              fractional
              tone="dark"
            />
            <span>
              ({new Intl.NumberFormat(locale).format(seller.reviews_count ?? 0)}
              )
            </span>
          </div>
        ) : (
          <p className="mt-1 text-xs text-marketplace-muted-foreground">
            {t("newShop")}
          </p>
        )}
        {category ? (
          <p className="mt-1 line-clamp-1 text-xs text-marketplace-muted-foreground sm:text-sm">
            {category}
          </p>
        ) : null}
      </div>

      <FollowShopButton
        sellerId={seller.id}
        returnTo={shopHref}
        iconOnly
        className="size-10 shrink-0"
      />
    </article>
  );
}
