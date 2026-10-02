import type { Seller } from "@spree/sdk";
import { Plane as VacationMode } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { StarRatingDisplay } from "@/components/reviews/StarRating";
import { ContactShopButton } from "@/components/shops/ContactShopButton";
import { FollowShopButton } from "@/components/shops/FollowShopButton";
import { ShopFollowersButton } from "@/components/shops/ShopFollowersButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sellerShopShellClass } from "@/lib/utils/seller-storefront";

type SellerProfile = Seller & {
  tagline?: string | null;
  on_vacation?: boolean;
  sellable?: boolean;
  vacation_announcement?: string | null;
  vacation_announcement_html?: string | null;
  accepts_custom_orders?: boolean;
};

interface SellerShopHeaderProps {
  seller: SellerProfile;
  basePath: string;
  following: boolean;
  messagingAvailable?: boolean;
  shopPath: string;
  followersCount?: number;
  customOrderHref?: string;
}

export async function SellerShopHeader({
  seller,
  basePath,
  following,
  messagingAvailable = true,
  shopPath,
  followersCount = 0,
  customOrderHref,
}: SellerShopHeaderProps) {
  const t = await getTranslations("sellers");
  const logo = seller.square_logo_url || seller.logo_url;
  const cover = seller.cover_photo_url;
  const onVacation = seller.on_vacation === true;
  const hasReviews =
    seller.average_rating != null && (seller.reviews_count ?? 0) > 0;
  const tagline = seller.tagline?.trim();

  return (
    <header
      className="bg-marketplace-surface"
      data-theme-seller-banner
      data-theme-seller-identity
    >
      <div className="relative h-[var(--marketplace-seller-cover-height-mobile)] w-full overflow-hidden bg-marketplace-surface-warm md:h-[var(--marketplace-seller-cover-height-desktop)]">
        {cover ? (
          // biome-ignore lint/performance/noImgElement: remote seller cover URLs
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-end bg-marketplace-accent/40 px-4 pb-4 sm:px-6"
            aria-hidden
          >
            <span className="font-display text-lg font-medium text-marketplace-muted-foreground/80">
              {seller.name}
            </span>
          </div>
        )}
      </div>

      <div
        className={`${sellerShopShellClass} border-b border-marketplace-border`}
      >
        <div className="flex flex-col gap-4 pb-5 pt-0 md:flex-row md:items-end md:justify-between md:gap-6">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div
              className={cn(
                "-mt-[calc(var(--marketplace-seller-logo-size-mobile)/2)] shrink-0 overflow-hidden rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface shadow-[var(--marketplace-shadow-card)]",
                "size-[var(--marketplace-seller-logo-size-mobile)] sm:-mt-[calc(var(--marketplace-seller-logo-size-desktop)/2)] sm:size-[var(--marketplace-seller-logo-size-desktop)]",
              )}
            >
              {logo ? (
                // biome-ignore lint/performance/noImgElement: remote seller logo URLs
                <img src={logo} alt="" className="h-full w-full object-cover" />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center bg-marketplace-surface-subtle text-xl font-semibold text-marketplace-foreground"
                  aria-hidden
                >
                  {seller.name.slice(0, 1)}
                </div>
              )}
            </div>
            <div className="min-w-0 pb-0.5">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-marketplace-foreground sm:text-3xl">
                {seller.name}
              </h1>
              {hasReviews ? (
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-marketplace-muted-foreground">
                  <StarRatingDisplay
                    rating={seller.average_rating!}
                    size="sm"
                    showValue
                  />
                  <span>({seller.reviews_count!.toLocaleString()})</span>
                </div>
              ) : (
                <p className="mt-1 text-sm text-marketplace-muted-foreground">
                  {t("shopNoReviewsYet")}
                </p>
              )}
              {tagline ? (
                <p className="mt-1.5 line-clamp-2 max-w-xl text-sm text-marketplace-foreground/90">
                  {tagline}
                </p>
              ) : null}
              {followersCount > 0 ? (
                <div className="mt-2">
                  <ShopFollowersButton
                    sellerIdOrSlug={seller.slug ?? seller.id}
                    followersCount={followersCount}
                    variant="header"
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
            <FollowShopButton
              sellerId={seller.id}
              initialFollowing={following}
              prominent
            />
            <ContactShopButton
              basePath={basePath}
              sellerSlug={seller.slug}
              returnTo={shopPath}
              messagingAvailable={messagingAvailable}
              prominent
            />
            {customOrderHref ? (
              <Link
                href={customOrderHref}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "rounded-[var(--marketplace-radius-sm)]",
                )}
              >
                {t("requestCustomOrder")}
              </Link>
            ) : null}
          </div>
        </div>

        {onVacation ? (
          <div
            role="status"
            className="mb-4 rounded-[var(--marketplace-radius-sm)] border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          >
            <p className="flex items-center gap-2 font-medium">
              <VacationMode className="size-4 shrink-0" aria-hidden />
              {t("vacationTitle")}
            </p>
            {seller.vacation_announcement_html ||
            seller.vacation_announcement ? (
              <div
                className="prose prose-sm mt-1 max-w-none text-amber-900"
                dangerouslySetInnerHTML={{
                  __html:
                    seller.vacation_announcement_html ||
                    seller.vacation_announcement ||
                    "",
                }}
              />
            ) : (
              <p className="mt-1 text-amber-900/90">{t("vacationDefault")}</p>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
