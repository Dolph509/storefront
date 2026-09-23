import type { Seller } from "@spree/sdk";

type ShopCardSeller = Seller & {
  tagline?: string | null;
  sales_count?: number | null;
};

import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { StarRatingDisplay } from "@/components/reviews/StarRating";
import { FollowShopButton } from "@/components/shops/FollowShopButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ShopCardVariant = "compact" | "rich";

interface ShopCardProps {
  seller: ShopCardSeller;
  basePath: string;
  locale: string;
  variant?: ShopCardVariant;
  showFollow?: boolean;
  className?: string;
}

export async function ShopCard({
  seller,
  basePath,
  locale,
  variant = "rich",
  showFollow = true,
  className,
}: ShopCardProps) {
  const tHome = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  const tShops = await getTranslations({
    locale: locale as Locale,
    namespace: "shops",
  });
  const logo = seller.square_logo_url || seller.logo_url;
  const shopHref = `${basePath}/sellers/${seller.slug}`;
  const hasReviews =
    seller.average_rating != null && (seller.reviews_count ?? 0) > 0;

  const stats: string[] = [];
  if ((seller.followers_count ?? 0) > 0) {
    stats.push(
      tShops("followersCount", { count: seller.followers_count ?? 0 }),
    );
  }
  if ((seller.sales_count ?? 0) > 0) {
    stats.push(tShops("salesCount", { count: seller.sales_count ?? 0 }));
  }

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface-elevated p-4 shadow-[var(--marketplace-shadow-card)]",
        variant === "compact" && "gap-3 p-3",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt={seller.name}
            className={cn(
              "rounded-full object-cover",
              variant === "compact" ? "size-10" : "size-12",
            )}
          />
        ) : (
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-marketplace-muted font-semibold text-marketplace-muted-foreground",
              variant === "compact" ? "size-10 text-sm" : "size-12",
            )}
            aria-hidden
          >
            {seller.name.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-marketplace-foreground">
            <Link
              href={shopHref}
              className="hover:text-marketplace-brand focus-visible:outline-2 focus-visible:outline-marketplace-brand"
            >
              {seller.name}
            </Link>
          </h3>
          {variant === "rich" && seller.tagline ? (
            <p className="mt-0.5 line-clamp-2 text-sm text-marketplace-muted-foreground">
              {seller.tagline}
            </p>
          ) : null}
          {hasReviews ? (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-marketplace-muted-foreground">
              <StarRatingDisplay
                rating={seller.average_rating!}
                size="sm"
                showValue
              />
              <span>({seller.reviews_count})</span>
            </div>
          ) : null}
          {variant === "rich" && stats.length > 0 ? (
            <p className="mt-1 text-xs text-marketplace-muted-foreground">
              {stats.join(" · ")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        {showFollow ? (
          <FollowShopButton
            sellerId={seller.id}
            returnTo={shopHref}
            prominent={variant === "rich"}
          />
        ) : null}
        <Link
          href={shopHref}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full",
          )}
        >
          {tHome("visitShop")}
        </Link>
      </div>
    </article>
  );
}
