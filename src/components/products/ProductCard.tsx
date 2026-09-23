"use client";

import type { Product } from "@spree/sdk";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { memo } from "react";
import { Star } from "@/components/icons";
import { FavoriteButton } from "@/components/products/FavoriteButton";
import { HiddenPricePrompt } from "@/components/products/HiddenPricePrompt";
import { ProductImage } from "@/components/ui/product-image";
import { trackSelectItem } from "@/lib/analytics/gtm";
import { productDetailPathSegment } from "@/lib/discovery-context";

interface ProductCardProps {
  product: Product;
  basePath?: string;
  categoryId?: string;
  index?: number;
  listId?: string;
  listName?: string;
  fetchPriority?: "high" | "low" | "auto";
  currency?: string;
  favorited?: boolean;
  onFavoriteChange?: (productId: string, favorited: boolean) => void;
  showFavorite?: boolean;
  href?: string;
  density?: "standard" | "compact" | "rail";
}

export const ProductCard = memo(function ProductCard({
  product,
  basePath = "",
  categoryId,
  index,
  listId,
  listName,
  fetchPriority,
  currency,
  favorited = false,
  onFavoriteChange,
  showFavorite = true,
  href,
  density = "standard",
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
  const isCompact = density === "compact";
  const isRail = density === "rail";
  const productHref =
    href ??
    `${basePath}/products/${productDetailPathSegment(product)}${categoryId ? `?category_id=${categoryId}` : ""}`;

  const handleClick = () => {
    if (index != null && listId && listName && currency) {
      trackSelectItem(product, listId, listName, index, currency);
    }
  };

  if (isRail) {
    return (
      <article className="group relative h-full">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#f3f3f3]">
          <ProductImage
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="160px"
            iconClassName="size-10"
            fetchPriority={fetchPriority}
          />
        </div>
        <div className="pt-2">
          <h3 className="line-clamp-1 text-sm leading-snug text-[#222]">
            <Link
              href={productHref}
              className="after:absolute after:inset-0 after:z-0"
              onClick={handleClick}
            >
              {product.name}
            </Link>
          </h3>
          <div className="relative z-[1] mt-0.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
            {displayPrice ? (
              <span
                className={
                  onSale
                    ? "text-sm font-bold text-[#258635]"
                    : "text-sm font-bold text-[#222]"
                }
              >
                {displayPrice}
              </span>
            ) : (
              <HiddenPricePrompt />
            )}
            {onSale && strikethroughPrice ? (
              <span className="text-sm text-[#757575] line-through">
                {strikethroughPrice}
              </span>
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  if (isCompact) {
    return (
      <div className="group relative">
        <div className="relative aspect-square overflow-hidden rounded-sm bg-marketplace-muted">
          <ProductImage
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            iconClassName="size-10"
            fetchPriority={fetchPriority}
          />
          {showFavorite ? (
            <div className="absolute right-2 top-2 z-[2]">
              <FavoriteButton
                productId={product.id}
                variantId={product.default_variant_id}
                favorited={favorited}
                onChange={onFavoriteChange}
                signInHref={`${basePath}/account`}
                className="opacity-100 transition-opacity duration-150 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 md:focus-visible:opacity-100 motion-reduce:transition-none"
              />
            </div>
          ) : null}
        </div>
        <div className="pt-2">
          <h3 className="line-clamp-1 text-xs font-medium text-marketplace-foreground transition-colors group-hover:text-marketplace-brand sm:text-sm">
            <Link
              href={productHref}
              className="after:absolute after:inset-0 after:z-0"
              onClick={handleClick}
            >
              {product.name}
            </Link>
          </h3>
          {displayPrice ? (
            <span className="mt-0.5 text-sm font-semibold text-marketplace-foreground">
              {displayPrice}
            </span>
          ) : (
            <HiddenPricePrompt />
          )}
        </div>
      </div>
    );
  }

  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden bg-marketplace-muted">
        <ProductImage
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
          iconClassName="size-14"
          fetchPriority={fetchPriority}
        />
        {onSale ? (
          <span className="absolute bottom-2 left-2 z-[1] rounded bg-marketplace-sale px-2 py-1 text-xs font-semibold text-white">
            {t("sale")}
          </span>
        ) : null}
        {showFavorite ? (
          <div className="absolute right-2 top-2 z-[2]">
            <FavoriteButton
              productId={product.id}
              variantId={product.default_variant_id}
              favorited={favorited}
              onChange={onFavoriteChange}
              signInHref={`${basePath}/account`}
              className="size-9 bg-white/95 opacity-100 transition-opacity duration-150 hover:bg-white md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 md:focus-visible:opacity-100 motion-reduce:transition-none"
            />
          </div>
        ) : null}
      </div>

      <div className="pt-3">
        <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-marketplace-foreground group-hover:text-marketplace-brand">
          <Link
            href={productHref}
            className="after:absolute after:inset-0 after:z-0"
            onClick={handleClick}
          >
            {product.name}
          </Link>
        </h3>
        {sellerName && sellerSlug ? (
          <p className="relative z-[1] mt-1 line-clamp-1 text-sm text-marketplace-muted-foreground">
            <Link
              href={`${basePath}/sellers/${sellerSlug}`}
              className="hover:text-marketplace-brand hover:underline"
            >
              {sellerName}
            </Link>
          </p>
        ) : sellerName ? (
          <p className="mt-1 line-clamp-1 text-sm text-marketplace-muted-foreground">
            {sellerName}
          </p>
        ) : null}
        {rating != null && reviewsCount > 0 ? (
          <div className="relative z-[1] mt-2 flex items-center gap-1 text-sm text-marketplace-muted-foreground">
            <Star
              className="size-4 fill-marketplace-brand text-marketplace-brand"
              aria-hidden
            />
            <span>{rating.toFixed(1)}</span>
            <span>({reviewsCount.toLocaleString()})</span>
          </div>
        ) : null}
        <div className="relative z-[1] mt-2 flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-2">
            {displayPrice ? (
              <span className="text-base font-semibold leading-none text-marketplace-foreground">
                {displayPrice}
              </span>
            ) : (
              <HiddenPricePrompt />
            )}
            {onSale && strikethroughPrice ? (
              <span className="text-xs text-marketplace-muted-foreground line-through">
                {strikethroughPrice}
              </span>
            ) : null}
          </div>
        </div>
        {!product.purchasable ? (
          <span className="mt-2 block text-xs text-marketplace-muted-foreground">
            {t("outOfStock")}
          </span>
        ) : null}
      </div>
    </article>
  );
});
