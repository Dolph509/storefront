"use client";

import type { Seller } from "@spree/sdk";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AskAboutProductButton } from "@/components/messages/AskAboutProductButton";
import { StarRatingDisplay } from "@/components/reviews/StarRating";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";

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
  const logo = seller.square_logo_url || seller.logo_url;
  const shopHref = `${basePath}/sellers/${seller.slug}`;
  const showAsk =
    layout === "meet" && Boolean(productId) && Boolean(productName);

  if (layout === "meet") {
    return (
      <section
        data-theme-product-seller
        className="space-y-4 border-t border-marketplace-border/70 pt-6"
      >
        <h2 className="text-base font-semibold text-marketplace-foreground">
          {t("meetYourSeller")}
        </h2>
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
            <Link
              href={shopHref}
              className="block truncate text-lg font-medium text-marketplace-foreground transition-colors hover:text-marketplace-brand hover:underline"
            >
              {seller.name}
            </Link>
            {seller.tagline?.trim() ? (
              <p className="truncate text-sm text-marketplace-muted-foreground">
                {seller.tagline.trim()}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-marketplace-muted-foreground">
              {showRating &&
              seller.reviews_count > 0 &&
              seller.average_rating != null ? (
                <span className="inline-flex items-center gap-1.5">
                  <StarRatingDisplay rating={seller.average_rating} size="sm" />
                  <span>({seller.reviews_count.toLocaleString()})</span>
                </span>
              ) : null}
              {seller.sales_count > 0 ? (
                <span>
                  {t("sellerSalesCount", { count: seller.sales_count })}
                </span>
              ) : null}
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
      </section>
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
        <Link
          href={shopHref}
          className="block truncate font-medium text-marketplace-foreground transition-colors hover:text-marketplace-brand hover:underline"
        >
          {seller.name}
        </Link>
        {showRating &&
        seller.reviews_count > 0 &&
        seller.average_rating != null ? (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-marketplace-muted-foreground">
            <StarRatingDisplay rating={seller.average_rating} size="sm" />
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
