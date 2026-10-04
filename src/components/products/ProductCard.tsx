"use client";

import type { Product } from "@spree/sdk";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { memo } from "react";
import { Star } from "@/components/icons";
import { FavoriteButton } from "@/components/products/FavoriteButton";
import { FeaturedCollectionQuickAdd } from "@/components/products/FeaturedCollectionQuickAdd";
import { HiddenPricePrompt } from "@/components/products/HiddenPricePrompt";
import {
  MerchandisingBadges,
  type MerchandisingSignal,
  selectMerchandisingSignals,
} from "@/components/products/MerchandisingBadges";
import { MerchandisingReason } from "@/components/products/MerchandisingReason";
import { ProductImage } from "@/components/ui/product-image";
import { useStoreThemeSettings } from "@/contexts/ThemeSettingsContext";
import { trackSelectItem } from "@/lib/analytics/gtm";
import { productDetailPathSegment } from "@/lib/discovery-context";
import { themeSettingEnabled } from "@/lib/theme/setting-value";

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
  density?: "default" | "standard" | "compact" | "editorial" | "rail";
  showSecondImageOnHover?: boolean;
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
  showSecondImageOnHover,
}: ProductCardProps) {
  const t = useTranslations("products");
  const {
    products_grid: gridSettings,
    localization,
    product_swatches: swatchSettings,
  } = useStoreThemeSettings();
  const imageRatio =
    gridSettings?.image_ratio && gridSettings.image_ratio !== "adapt"
      ? { aspectRatio: "var(--marketplace-product-image-ratio)" }
      : undefined;
  const useNaturalImageRatio =
    gridSettings?.image_ratio === "adapt" && Boolean(product.thumbnail_url);
  const showVendor = themeSettingEnabled(gridSettings?.show_vendor, true);
  const showRating = themeSettingEnabled(gridSettings?.show_rating, true);
  const showCardFavorite =
    themeSettingEnabled(gridSettings?.show_favorites, true) && showFavorite;
  const showQuickAdd = themeSettingEnabled(gridSettings?.show_quick_add);
  const showSecondImage =
    showSecondImageOnHover ??
    themeSettingEnabled(gridSettings?.show_second_image);
  const imageUrl = product.thumbnail_url || null;
  const secondImageUrl = showSecondImage
    ? product.media?.find(
        (item) => item.media_type === "image" && item.original_url !== imageUrl,
      )?.small_url || null
    : null;
  const rawDisplayPrice = product.price?.display_amount;
  const displayCurrency = currency || product.price?.currency || "";
  const displayPrice =
    rawDisplayPrice &&
    localization?.currency_format === "with_currency" &&
    displayCurrency &&
    !rawDisplayPrice.toUpperCase().includes(displayCurrency.toUpperCase())
      ? `${rawDisplayPrice} ${displayCurrency}`
      : rawDisplayPrice && localization?.currency_format === "without_currency"
        ? rawDisplayPrice.replace(/\s+[A-Z]{3}$/, "")
        : rawDisplayPrice;
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
  const themeDensity = String(gridSettings?.card_density || "default");
  const effectiveDensity =
    density === "standard" || density === "default"
      ? themeDensity === "compact" || themeDensity === "editorial"
        ? themeDensity
        : density
      : density;
  const isCompact = effectiveDensity === "compact";
  const isRail = effectiveDensity === "rail";
  const isEditorial = effectiveDensity === "editorial";
  const personalizable = (product.personalization_fields?.length ?? 0) > 0;
  const showBadges = themeSettingEnabled(gridSettings?.show_badges, true);
  const configuredMaxBadges = Number(gridSettings?.max_badges ?? 2);
  const maxBadges = Number.isFinite(configuredMaxBadges)
    ? Math.max(1, Math.min(2, Math.floor(configuredMaxBadges)))
    : 2;
  const badgePosition =
    gridSettings?.badge_position === "top_right" ? "top_right" : "top_left";
  const allowedBadgesSetting = (
    gridSettings as Record<string, unknown> | undefined
  )?.allowed_badges;
  const allowedBadges = Array.isArray(allowedBadgesSetting)
    ? allowedBadgesSetting.filter(
        (key): key is string => typeof key === "string",
      )
    : typeof allowedBadgesSetting === "string" &&
        allowedBadgesSetting.trim().length > 0
      ? allowedBadgesSetting
          .split(",")
          .map((key) => key.trim())
          .filter(Boolean)
      : null;
  const showPersonalizedSignals = themeSettingEnabled(
    (gridSettings as Record<string, unknown> | undefined)
      ?.show_personalized_signals,
    true,
  );
  const showRelevanceReason = themeSettingEnabled(
    (gridSettings as Record<string, unknown> | undefined)
      ?.show_relevance_reason,
    true,
  );
  const allowedPersonalizedSetting = (
    gridSettings as Record<string, unknown> | undefined
  )?.allowed_personalized_signals;
  const allowedPersonalizedSignals = Array.isArray(allowedPersonalizedSetting)
    ? allowedPersonalizedSetting.filter(
        (key): key is string => typeof key === "string",
      )
    : typeof allowedPersonalizedSetting === "string" &&
        allowedPersonalizedSetting.trim().length > 0
      ? allowedPersonalizedSetting
          .split(",")
          .map((key) => key.trim())
          .filter(Boolean)
      : null;
  const merchandisingSignals =
    (
      product as Product & {
        merchandising_signals?: MerchandisingSignal[];
      }
    ).merchandising_signals ?? [];
  const merchandisingProductId =
    product.default_variant?.sku ||
    product.variants?.find((variant) => variant.sku)?.sku ||
    product.slug;
  const productHref =
    href ??
    `${basePath}/products/${productDetailPathSegment(product)}${categoryId ? `?category_id=${categoryId}` : ""}`;
  const swatchOption = String(
    swatchSettings?.option_name || "color",
  ).toLowerCase();
  const productSwatches = themeSettingEnabled(swatchSettings?.enabled)
    ? (product.option_values || []).filter(
        (value) =>
          value.option_type_name.toLowerCase() === swatchOption ||
          value.option_type_label.toLowerCase() === swatchOption,
      )
    : [];
  const swatches = productSwatches.slice(0, 6);
  const swatchStyle = String(swatchSettings?.color_style || "color");
  const swatchSize = String(swatchSettings?.size || "medium");

  const handleClick = () => {
    if (index != null && listId && listName && currency) {
      trackSelectItem(product, listId, listName, index, currency);
    }
  };

  if (isRail) {
    return (
      <article
        className="group/card relative h-full"
        data-merchandising-product={merchandisingProductId}
      >
        <div
          className={`relative overflow-hidden rounded-[var(--marketplace-product-card-radius)] bg-marketplace-surface-subtle ${useNaturalImageRatio ? "" : "aspect-square"}`}
          style={imageRatio}
        >
          <Link
            href={productHref}
            className="absolute inset-0 z-[1]"
            aria-label={product.name}
            onClick={handleClick}
          />
          <ProductImage
            src={imageUrl}
            alt={product.name}
            {...(useNaturalImageRatio
              ? { width: 1200, height: 1500 }
              : { fill: true })}
            className={
              useNaturalImageRatio
                ? "h-auto w-full object-cover"
                : "object-cover"
            }
            sizes="160px"
            iconClassName="size-10"
            fetchPriority={fetchPriority}
          />
          {showSecondImage && secondImageUrl ? (
            <img
              src={secondImageUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-200 group-hover/card:opacity-100 motion-reduce:transition-none"
            />
          ) : null}
          <ProductCardBadges
            signals={merchandisingSignals}
            show={showBadges}
            maxBadges={maxBadges}
            allowedSignals={allowedBadges}
            position={badgePosition}
            onSale={onSale}
            personalizable={personalizable}
            saleLabel={t("sale")}
            personalizableLabel={t("personalizable")}
          />
          {showCardFavorite ? (
            <div className="pointer-events-none absolute right-2 top-2 z-[2] opacity-100 transition-opacity duration-150 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/card:opacity-100 [@media(hover:hover)]:group-focus-within/card:opacity-100 motion-reduce:transition-none">
              <FavoriteButton
                productId={product.id}
                variantId={product.default_variant_id}
                favorited={favorited}
                onChange={onFavoriteChange}
                className="pointer-events-auto size-9 !bg-white hover:!bg-white"
              />
            </div>
          ) : null}
          <div
            className="pointer-events-none absolute bottom-2 left-2 z-[2] max-w-[calc(100%-1rem)] rounded-full bg-white/95 px-2.5 py-1 shadow-[var(--marketplace-shadow-card)] backdrop-blur-[2px]"
            data-theme-product-price-pill
          >
            {displayPrice ? (
              <span className="flex flex-wrap items-baseline gap-x-1.5 text-xs font-semibold tabular-nums">
                <span
                  className={
                    onSale
                      ? "text-marketplace-sale"
                      : "text-marketplace-foreground"
                  }
                >
                  {displayPrice}
                </span>
                {onSale && strikethroughPrice ? (
                  <span className="font-medium text-marketplace-muted-foreground line-through">
                    {strikethroughPrice}
                  </span>
                ) : null}
              </span>
            ) : (
              <HiddenPricePrompt />
            )}
          </div>
        </div>
        <div className="pt-1.5">
          <h3 className="line-clamp-2 text-sm leading-snug text-marketplace-foreground">
            <Link href={productHref} onClick={handleClick}>
              {product.name}
            </Link>
          </h3>
        </div>
      </article>
    );
  }

  if (isCompact) {
    return (
      <div className="group relative">
        <div
          className={`relative overflow-hidden rounded-[var(--marketplace-product-card-radius)] bg-marketplace-surface-subtle ${useNaturalImageRatio ? "" : "aspect-square"}`}
          style={imageRatio}
        >
          <ProductImage
            src={imageUrl}
            alt={product.name}
            {...(useNaturalImageRatio
              ? { width: 1200, height: 1500 }
              : { fill: true })}
            className={`object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${useNaturalImageRatio ? "h-auto w-full" : ""}`}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            iconClassName="size-10"
            fetchPriority={fetchPriority}
          />
          {secondImageUrl ? (
            <img
              src={secondImageUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none"
            />
          ) : null}
          <ProductCardBadges
            signals={merchandisingSignals}
            show={showBadges}
            maxBadges={maxBadges}
            allowedSignals={allowedBadges}
            position={badgePosition}
            onSale={onSale}
            personalizable={personalizable}
            saleLabel={t("sale")}
            personalizableLabel={t("personalizable")}
          />
          {showCardFavorite ? (
            <div className="absolute right-2 top-2 z-[2]">
              <FavoriteButton
                productId={product.id}
                variantId={product.default_variant_id}
                favorited={favorited}
                onChange={onFavoriteChange}
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
          {swatches.length > 0 ? (
            <ProductCardSwatches
              options={swatches}
              total={productSwatches.length}
              style={swatchStyle}
              size={swatchSize}
            />
          ) : null}
          {showQuickAdd && product.purchasable ? (
            <div className="relative z-[2] mt-2">
              <FeaturedCollectionQuickAdd
                variantId={product.default_variant_id}
              />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <article
      className="group relative min-w-0"
      data-card-density={effectiveDensity}
      data-merchandising-product={merchandisingProductId}
    >
      <div
        className={`relative overflow-hidden rounded-[var(--marketplace-product-card-radius)] bg-marketplace-surface-subtle shadow-[var(--marketplace-product-shadow,var(--marketplace-shadow-card))] transition-shadow duration-200 ease-out group-hover:shadow-[var(--marketplace-product-shadow-hover,var(--marketplace-shadow-card-hover))] motion-reduce:transition-none ${useNaturalImageRatio ? "" : "aspect-[var(--marketplace-product-image-ratio)]"}`}
        style={imageRatio}
      >
        <ProductImage
          src={imageUrl}
          alt={product.name}
          {...(useNaturalImageRatio
            ? { width: 1200, height: 1500 }
            : { fill: true })}
          className={`object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${useNaturalImageRatio ? "h-auto w-full" : ""}`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          iconClassName="size-14"
          fetchPriority={fetchPriority}
        />
        {secondImageUrl ? (
          <img
            src={secondImageUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          />
        ) : null}
        <ProductCardBadges
          signals={merchandisingSignals}
          show={showBadges}
          maxBadges={maxBadges}
          allowedSignals={allowedBadges}
          position={badgePosition}
          onSale={onSale}
          personalizable={personalizable}
          saleLabel={t("sale")}
          personalizableLabel={t("personalizable")}
        />
        {showCardFavorite ? (
          <div className="absolute right-2 top-2 z-[2]">
            <FavoriteButton
              productId={product.id}
              variantId={product.default_variant_id}
              favorited={favorited}
              onChange={onFavoriteChange}
              className="size-9 bg-white opacity-100 transition-opacity duration-150 hover:bg-white md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 md:focus-visible:opacity-100 motion-reduce:transition-none"
            />
          </div>
        ) : null}
      </div>

      <div className={`min-w-0 space-y-1.5 ${isEditorial ? "pt-4" : "pt-3.5"}`}>
        {showVendor && sellerName && sellerSlug ? (
          <p className="relative z-[1] line-clamp-1 text-xs font-medium text-marketplace-muted-foreground">
            <Link
              href={`${basePath}/sellers/${sellerSlug}`}
              className="hover:text-marketplace-brand hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketplace-brand"
            >
              {sellerName}
            </Link>
          </p>
        ) : showVendor && sellerName ? (
          <p className="line-clamp-1 text-xs font-medium text-marketplace-muted-foreground">
            {sellerName}
          </p>
        ) : null}
        <h3
          className={`min-w-0 line-clamp-2 font-medium leading-snug text-marketplace-foreground transition-colors group-hover:text-marketplace-brand ${isEditorial ? "text-base" : "text-sm sm:text-[15px]"}`}
        >
          <Link
            href={productHref}
            className="after:absolute after:inset-0 after:z-0 focus-visible:after:rounded-[var(--marketplace-product-card-radius)] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-marketplace-brand"
            onClick={handleClick}
          >
            {product.name}
          </Link>
        </h3>
        {showPersonalizedSignals && showRelevanceReason ? (
          <MerchandisingReason
            signals={merchandisingSignals}
            allowedSignals={allowedPersonalizedSignals}
            className="relative z-[1]"
          />
        ) : null}
        {showRating && rating != null && reviewsCount > 0 ? (
          <div className="relative z-[1] flex items-center gap-1 text-xs text-marketplace-muted-foreground">
            <Star
              className="size-3.5 fill-marketplace-brand text-marketplace-brand"
              aria-hidden
            />
            <span>{rating.toFixed(1)}</span>
            <span>({reviewsCount.toLocaleString()})</span>
          </div>
        ) : null}
        {swatches.length > 0 ? (
          <ProductCardSwatches
            options={swatches}
            total={productSwatches.length}
            style={swatchStyle}
            size={swatchSize}
          />
        ) : null}
        <div className="relative z-[1] flex min-w-0 items-end justify-between gap-2 pt-1">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
            {displayPrice ? (
              <span
                className={`font-semibold tabular-nums sm:text-base ${onSale ? "text-marketplace-sale" : "text-marketplace-foreground"} ${isEditorial ? "text-base" : "text-sm"}`}
              >
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
        {showQuickAdd && product.purchasable ? (
          <div className="relative z-[2] mt-2">
            <FeaturedCollectionQuickAdd
              variantId={product.default_variant_id}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
});

function ProductCardBadges({
  signals,
  show,
  maxBadges,
  allowedSignals,
  position,
  onSale,
  personalizable,
  saleLabel,
  personalizableLabel,
}: {
  signals: MerchandisingSignal[];
  show: boolean;
  maxBadges: number;
  allowedSignals: string[] | null;
  position: "top_left" | "top_right";
  onSale: boolean;
  personalizable: boolean;
  saleLabel: string;
  personalizableLabel: string;
}) {
  if (!show) return null;

  const visibleSignals = selectMerchandisingSignals({
    signals,
    maxBadges,
    allowedSignals,
  });
  const saleAllowed =
    allowedSignals === null || allowedSignals.includes("sale");
  const hasBackendSale = signals.some((signal) => signal.key === "sale");
  const showLegacySale =
    onSale &&
    saleAllowed &&
    !hasBackendSale &&
    visibleSignals.length < maxBadges;
  const showPersonalizable =
    personalizable &&
    visibleSignals.length + (showLegacySale ? 1 : 0) < maxBadges;

  if (visibleSignals.length === 0 && !showLegacySale && !showPersonalizable) {
    return null;
  }

  return (
    <div
      className={`pointer-events-none absolute top-2.5 z-[1] flex max-w-[calc(100%-3rem)] flex-wrap gap-1 ${
        position === "top_right" ? "right-2.5 mr-10 justify-end" : "left-2.5"
      }`}
    >
      <MerchandisingBadges
        signals={signals}
        maxBadges={maxBadges}
        allowedSignals={allowedSignals}
        position={position}
        className="!static max-w-none"
      />
      {showLegacySale ? (
        <span className="rounded-full bg-marketplace-sale px-2 py-0.5 text-[11px] font-semibold leading-4 text-white">
          {saleLabel}
        </span>
      ) : null}
      {showPersonalizable ? (
        <span className="rounded-full bg-marketplace-surface/95 px-2 py-0.5 text-[11px] font-medium leading-4 text-marketplace-foreground ring-1 ring-marketplace-border">
          {personalizableLabel}
        </span>
      ) : null}
    </div>
  );
}

export function ProductCardSwatches({
  options,
  total,
  style,
  size,
  label = "Available color options",
}: {
  options: NonNullable<Product["option_values"]>;
  total: number;
  style: string;
  size: string;
  label?: string;
}) {
  const dotSize =
    size === "small" ? "size-3" : size === "large" ? "size-5" : "size-4";
  const labelSize =
    size === "small"
      ? "text-[9px] px-1.5"
      : size === "large"
        ? "text-xs px-2.5"
        : "text-[10px] px-2";
  return (
    <ul
      aria-label={label}
      className="relative z-[1] mt-2 flex flex-wrap items-center gap-1.5"
    >
      {options.map((option) => (
        <li key={option.id}>
          <span
            role="img"
            aria-label={option.label}
            title={option.label}
            className={
              style === "label" || style === "label_color"
                ? `rounded border border-marketplace-border py-0.5 ${labelSize}`
                : `block ${dotSize} rounded-full border border-marketplace-border`
            }
            style={
              style === "image" && option.image_url
                ? {
                    backgroundImage: `url(${option.image_url})`,
                    backgroundSize: "cover",
                  }
                : style !== "label" && option.color_code
                  ? { backgroundColor: option.color_code }
                  : undefined
            }
          >
            {style === "label" || style === "label_color" ? option.label : null}
          </span>
        </li>
      ))}
      {total > options.length ? (
        <li className="text-[10px] text-marketplace-muted-foreground">
          +{total - options.length}
        </li>
      ) : null}
    </ul>
  );
}
