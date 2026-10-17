"use client";

import type { Seller } from "@spree/sdk";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ChevronDown } from "@/components/icons";
import { AskAboutProductButton } from "@/components/messages/AskAboutProductButton";
import { StarRatingDisplay } from "@/components/reviews/StarRating";
import { FollowShopButton } from "@/components/shops/FollowShopButton";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { useAuth } from "@/contexts/AuthContext";
import { getFollowStatuses } from "@/lib/data/follows";

interface ProductSellerIdentityProps {
  seller: Seller;
  basePath: string;
  showLogo?: boolean;
  showRating?: boolean;
  showVisitShop?: boolean;
  /** Richer PDP card with sales and ask-about CTA. */
  layout?: "inline" | "meet";
  productId?: string;
  productName?: string;
  messagingAvailable?: boolean | null;
}

export function ProductSellerIdentity({
  seller,
  basePath,
  showLogo = true,
  showRating = true,
  showVisitShop = true,
  layout = "inline",
  productId,
  productName,
  messagingAvailable,
}: ProductSellerIdentityProps) {
  const t = useTranslations("products");
  const th = useTranslations("home");
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [following, setFollowing] = useState(false);
  const logo = seller.square_logo_url || seller.logo_url;
  const shopHref = `${basePath}/sellers/${seller.slug}`;
  const starSellerBadge = seller.badges?.find(
    (badge) => badge.key === "star_seller",
  );
  const showAsk =
    layout === "meet" && Boolean(productId) && Boolean(productName);
  const hasReviews =
    showRating && seller.reviews_count > 0 && seller.average_rating != null;

  useEffect(() => {
    if (layout !== "meet" || !isAuthenticated) return;
    let cancelled = false;
    getFollowStatuses([seller.id]).then((result) => {
      if (cancelled || !result.success) return;
      setFollowing(Boolean(result.data?.[seller.id]));
    });
    return () => {
      cancelled = true;
    };
  }, [layout, isAuthenticated, seller.id]);

  if (layout === "meet") {
    const followButtonClass =
      "h-9 shrink-0 rounded-full border-[#222] bg-transparent px-3 text-xs font-semibold text-[#222] shadow-none hover:bg-[#f5f5f5] sm:px-4 sm:text-sm";

    return (
      <details
        data-theme-product-seller
        className="group border-b border-[#e1e3df] py-4"
      >
        <summary className="cursor-pointer list-none text-[16px] font-semibold text-[#222] marker:hidden [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-3">
            <span className="min-w-0">{t("meetTheMaker")}</span>
            <ChevronDown
              aria-hidden
              className="size-5 shrink-0 text-[#222] transition-transform group-open:rotate-180"
            />
          </span>
        </summary>
        <div className="mt-4 space-y-4">
          <div className="flex justify-end">
            <FollowShopButton
              sellerId={seller.id}
              sellerSlug={seller.slug}
              initialFollowing={following}
              returnTo={pathname}
              className={followButtonClass}
            />
          </div>
          <div className="flex items-start gap-3 sm:gap-4">
            {showLogo ? (
              <Link
                href={shopHref}
                className="relative size-14 shrink-0 overflow-hidden rounded-full border border-marketplace-border bg-marketplace-surface"
                aria-label={seller.name}
              >
                {logo ? (
                  <ProductImage
                    src={logo}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <span
                    className="flex size-full items-center justify-center text-base font-semibold text-marketplace-brand"
                    aria-hidden
                  >
                    {seller.name.charAt(0)}
                  </span>
                )}
              </Link>
            ) : null}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <Link
                  href={shopHref}
                  className="block truncate text-lg font-medium text-marketplace-foreground transition-colors hover:text-marketplace-brand hover:underline"
                >
                  {seller.name}
                </Link>
                {starSellerBadge ? (
                  <StarSellerBadge
                    badge={starSellerBadge}
                    sellerId={seller.id}
                  />
                ) : null}
              </div>
              {seller.tagline?.trim() ? (
                <p className="truncate text-sm text-marketplace-muted-foreground">
                  {seller.tagline.trim()}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-marketplace-muted-foreground">
                {hasReviews ? (
                  <span className="inline-flex items-center gap-1.5">
                    <StarRatingDisplay
                      rating={seller.average_rating!}
                      size="sm"
                    />
                    <span>({seller.reviews_count.toLocaleString()})</span>
                  </span>
                ) : null}
                {seller.sales_count > 0 ? (
                  <span>
                    {t("sellerSalesCount", { count: seller.sales_count })}
                  </span>
                ) : null}
                {(hasReviews || seller.sales_count > 0) &&
                seller.ships_from?.trim() ? (
                  <span aria-hidden>·</span>
                ) : null}
                {seller.ships_from?.trim() ? (
                  <span>{seller.ships_from.trim()}</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          {showVisitShop ? (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1 rounded-full"
            >
              <Link href={shopHref}>{t("viewShop")}</Link>
            </Button>
          ) : null}
          {showAsk ? (
            <div className="flex-1 [&_button]:rounded-full">
              <AskAboutProductButton
                basePath={basePath}
                productId={productId!}
                productName={productName!}
                messagingAvailable={messagingAvailable !== false}
              />
            </div>
          ) : null}
        </div>
      </details>
    );
  }

  return (
    <div
      data-theme-product-seller
      className="flex items-center gap-3 rounded-[var(--marketplace-radius-md)] border border-marketplace-border bg-marketplace-surface-subtle p-3 sm:gap-4 sm:p-4"
    >
      {showLogo ? (
        <Link
          href={shopHref}
          className="relative size-11 shrink-0 overflow-hidden rounded-full border border-marketplace-border bg-marketplace-surface sm:size-12"
          aria-label={seller.name}
        >
          {logo ? (
            <ProductImage
              src={logo}
              alt=""
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <span
              className="flex size-full items-center justify-center text-sm font-semibold text-marketplace-brand"
              aria-hidden
            >
              {seller.name.charAt(0)}
            </span>
          )}
        </Link>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-marketplace-muted-foreground">
          {t("soldBy")}
        </p>
        <div className="flex min-w-0 items-center gap-1.5">
          <Link
            href={shopHref}
            className="truncate font-medium text-marketplace-foreground transition-colors hover:text-marketplace-brand hover:underline"
          >
            {seller.name}
          </Link>
          {starSellerBadge ? (
            <StarSellerBadge badge={starSellerBadge} sellerId={seller.id} />
          ) : null}
        </div>
        {hasReviews ? (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-marketplace-muted-foreground">
            <StarRatingDisplay rating={seller.average_rating!} size="sm" />
            <span>({seller.reviews_count.toLocaleString()})</span>
          </div>
        ) : null}
      </div>
      {showVisitShop ? (
        <Button
          variant="outline"
          size="sm"
          asChild
          className="hidden shrink-0 rounded-full sm:inline-flex"
        >
          <Link href={shopHref}>{th("visitShop")}</Link>
        </Button>
      ) : null}
    </div>
  );
}

export function StarSellerBadge({
  badge,
  sellerId,
}: {
  badge: NonNullable<Seller["badges"]>[number];
  sellerId: string;
}) {
  const descriptionId = `star-seller-description-${sellerId}`;

  return (
    <span className="group relative inline-flex shrink-0">
      <button
        type="button"
        aria-label={badge.label}
        aria-describedby={descriptionId}
        className="inline-flex size-5 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marketplace-brand focus-visible:ring-offset-2"
      >
        {/* biome-ignore lint/performance/noImgElement: Reuse the public seller badge artwork exactly. */}
        <img
          src="/seller-badges/star-seller.svg"
          alt=""
          className="size-5"
          aria-hidden="true"
        />
      </button>
      <span
        id={descriptionId}
        role="tooltip"
        className="pointer-events-none invisible absolute left-0 top-full z-50 mt-3 w-[264px] rounded-lg border border-marketplace-border bg-white p-4 text-left text-sm text-[#38343a] opacity-0 shadow-[0_8px_28px_rgb(0_0_0_/_14%)] transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        <span
          aria-hidden="true"
          className="absolute -top-1 left-6 size-2 rotate-45 border-l border-t border-marketplace-border bg-white"
        />
        <span className="block font-semibold">{badge.label}</span>
        <span className="mt-1 block leading-5">{badge.description}</span>
      </span>
    </span>
  );
}
