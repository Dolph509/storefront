"use client";

import type { Seller } from "@spree/sdk";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { StarRatingDisplay } from "@/components/reviews/StarRating";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";

interface ProductSellerIdentityProps {
  seller: Seller;
  basePath: string;
  showLogo?: boolean;
  showRating?: boolean;
  showVisitShop?: boolean;
}

export function ProductSellerIdentity({
  seller,
  basePath,
  showLogo = true,
  showRating = true,
  showVisitShop = true,
}: ProductSellerIdentityProps) {
  const t = useTranslations("products");
  const th = useTranslations("home");
  const logo = seller.square_logo_url || seller.logo_url;
  const shopHref = `${basePath}/sellers/${seller.slug}`;

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
