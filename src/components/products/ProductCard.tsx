"use client";

import type { Product } from "@spree/sdk";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { memo, useEffect } from "react";
import { FavoriteButton } from "@/components/products/FavoriteButton";
import { HiddenPricePrompt } from "@/components/products/HiddenPricePrompt";
import { StarRatingDisplay } from "@/components/reviews/StarRating";
import { ProductImage } from "@/components/ui/product-image";
import { trackSelectItem } from "@/lib/analytics/gtm";
import {
  recordDiscoveryClick,
  recordDiscoveryImpression,
} from "@/lib/discovery/discovery-analytics";
import type { DiscoveryContext } from "@/lib/discovery/types";

interface ProductCardProps {
  product: Product;
  basePath?: string;
  categoryId?: string;
  index?: number;
  listId?: string;
  listName?: string;
  /** Marketplace discovery attribution (Phase E.3). */
  discovery?: DiscoveryContext;
  /** Dedupe impressions across remounts for the same listing state. */
  discoveryPageKey?: string;
  fetchPriority?: "high" | "low" | "auto";
  /** Optional currency used for analytics; omit to skip the select_item event. */
  currency?: string;
  /** When set, shows favorite control (authenticated buyers). */
  favorited?: boolean;
  onFavoriteChange?: (productId: string, favorited: boolean) => void;
  showFavorite?: boolean;
}

export const ProductCard = memo(function ProductCard({
  product,
  basePath = "",
  categoryId,
  index,
  listId,
  listName,
  discovery,
  discoveryPageKey,
  fetchPriority,
  currency,
  favorited = false,
  onFavoriteChange,
  showFavorite = true,
}: ProductCardProps) {
  const t = useTranslations("products");
  const imageUrl = product.thumbnail_url || null;

  const displayPrice = product.price?.display_amount;

  const currentAmountCents = product.price?.amount_in_cents;
  const originalAmountCents = product.original_price?.amount_in_cents;
  const compareAtAmountCents = product.price?.compare_at_amount_in_cents;
  const onSale =
    (currentAmountCents != null &&
      originalAmountCents != null &&
      currentAmountCents < originalAmountCents) ||
    (compareAtAmountCents != null &&
      currentAmountCents != null &&
      currentAmountCents < compareAtAmountCents);

  const strikethroughPrice = onSale
    ? ((product.original_price?.display_amount &&
      product.original_price.display_amount !== displayPrice
        ? product.original_price.display_amount
        : product.price?.display_compare_at_amount) ?? null)
    : null;

  const sellerName = product.seller?.name || product.seller_name;
  const sellerSlug = product.seller?.slug || product.seller_slug;
  const rating = product.average_rating;
  const reviewsCount = product.reviews_count ?? 0;

  useEffect(() => {
    if (!discovery) return;
    recordDiscoveryImpression(product, discovery, discoveryPageKey);
  }, [product, discovery, discoveryPageKey]);

  const handleClick = () => {
    if (discovery) {
      recordDiscoveryClick(product, discovery);
    }
    if (index != null && listId && listName && currency) {
      trackSelectItem(product, listId, listName, index, currency);
    }
  };

  return (
    <div className="group relative">
      <div className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
        <ProductImage
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 300px"
          iconClassName="w-16 h-16"
          fetchPriority={fetchPriority}
        />
        {onSale && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded z-[1]">
            {t("sale")}
          </span>
        )}
        {showFavorite ? (
          <div className="absolute top-2 right-2 z-[2]">
            <FavoriteButton
              productId={product.id}
              variantId={product.default_variant_id}
              favorited={favorited}
              onChange={onFavoriteChange}
            />
          </div>
        ) : null}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
          <Link
            href={`${basePath}/products/${product.slug}${categoryId ? `?category_id=${categoryId}` : ""}`}
            className="after:absolute after:inset-0 after:z-0"
            onClick={handleClick}
          >
            {product.name}
          </Link>
        </h3>

        <div className="mt-2 flex items-center gap-2">
          {displayPrice ? (
            <span className="text-lg font-semibold text-gray-900">
              {displayPrice}
            </span>
          ) : (
            <HiddenPricePrompt />
          )}
          {onSale && strikethroughPrice && (
            <span className="text-sm text-gray-500 line-through">
              {strikethroughPrice}
            </span>
          )}
        </div>

        {rating != null && reviewsCount > 0 ? (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-600 relative z-[1]">
            <StarRatingDisplay rating={rating} size="sm" showValue />
            <span>({reviewsCount})</span>
          </div>
        ) : null}

        {sellerName && sellerSlug ? (
          <p className="mt-1.5 text-sm text-gray-600 relative z-[1]">
            <Link
              href={`${basePath}/sellers/${sellerSlug}`}
              className="hover:text-primary hover:underline"
            >
              {sellerName}
            </Link>
          </p>
        ) : sellerName ? (
          <p className="mt-1.5 text-sm text-gray-600">{sellerName}</p>
        ) : null}

        {!product.purchasable && (
          <span className="mt-2 text-sm text-gray-500">{t("outOfStock")}</span>
        )}
      </div>
    </div>
  );
});
