"use client";

import type { Media, Product, Variant } from "@spree/sdk";
import {
  CircleCheckBig,
  CircleX,
  Loader2,
  Share2,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { QuantityPickerField } from "@/components/cart/QuantityPickerField";
import { HiddenPricePrompt } from "@/components/products/HiddenPricePrompt";
import { MediaGallery } from "@/components/products/MediaGallery";
import { ProductCustomFields } from "@/components/products/ProductCustomFields";
import { VariantPicker } from "@/components/products/VariantPicker";
import { StarRatingDisplay } from "@/components/reviews/StarRating";
import { ProductPageBlocksProvider } from "@/components/theme/resource/ProductPageBlocks";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useHiddenPricing } from "@/contexts/HiddenPricingContext";
import { useStore } from "@/contexts/StoreContext";
import { useStoreThemeSettings } from "@/contexts/ThemeSettingsContext";
import { trackAddToCart, trackViewItem } from "@/lib/analytics/gtm";
import type { CartDiscoveryInput } from "@/lib/discovery-context";
import {
  buildPersonalizationPayload,
  mapServerPersonalizationErrors,
  type PersonalizationAnswers,
  type PersonalizationFieldError,
  validatePersonalizationAnswers,
} from "@/lib/personalization";
import { themeSettingEnabled } from "@/lib/theme/setting-value";
import { RequestCustomOrderForm } from "../../sellers/[slug]/RequestCustomOrderForm";

interface ProductDetailsProps {
  product: Product;
  basePath: string;
  sellerShopDiscovery?: CartDiscoveryInput;
  fixedQuantity?: boolean;
  appearance?: Record<string, unknown>;
  globalSettings?: Record<string, string | boolean>;
  productNavigation?: {
    previous?: { name: string; slug: string };
    next?: { name: string; slug: string };
  };
  templateBlocks?: ReactNode[];
  templateDescriptionBlockPresent?: boolean;
  templateMediaSettings?: Record<string, unknown>;
  templateMediaBlockId?: string;
}

export function ProductDetails({
  product,
  basePath,
  sellerShopDiscovery,
  fixedQuantity = false,
  appearance = {},
  globalSettings = {},
  productNavigation,
  templateBlocks,
  templateDescriptionBlockPresent = false,
  templateMediaSettings,
  templateMediaBlockId,
}: ProductDetailsProps) {
  const { addItem, updating } = useCart();
  const { currency } = useStore();
  const {
    social,
    product_swatches: swatchSettings,
    size_chart: sizeChartSettings,
  } = useStoreThemeSettings();
  const galleryStyle =
    appearance.gallery_style === "thumbnails_bottom" ||
    appearance.gallery_style === "bottom"
      ? "bottom"
      : "left";
  const imageRatio =
    appearance.image_ratio === "portrait" ? "portrait" : "square";
  const stickyCart =
    themeSettingEnabled(appearance.sticky_cart) ||
    themeSettingEnabled(globalSettings.sticky_cart);
  const productStatus = (product as Product & { status?: string }).status;
  const t = useTranslations("products");
  const tp = useTranslations("personalization");
  const tc = useTranslations("customOrders");
  const tr = useTranslations("reviews");
  const tw = useTranslations("wholesale");
  const hiddenPricing = useHiddenPricing();
  const pricesHidden = hiddenPricing !== null;

  const variants = useMemo(() => {
    return (product.variants || []).filter(Boolean);
  }, [product.variants]);

  const hasVariants = variants.length > 0;
  const optionTypes = product.option_types || [];
  const personalizationFields = product.personalization_fields ?? [];
  const hasPersonalization = personalizationFields.length > 0;

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(() => {
    if (product.default_variant) {
      return product.default_variant;
    }
    if (hasVariants) {
      return variants.find((v) => v.purchasable) || variants[0];
    }
    return product.default_variant || null;
  });

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [personalizationAnswers, setPersonalizationAnswers] =
    useState<PersonalizationAnswers>({});
  const [personalizationErrors, setPersonalizationErrors] = useState<
    PersonalizationFieldError[]
  >([]);

  useEffect(() => {
    trackViewItem(product, currency);
  }, [product, currency]);

  const galleryImages = useMemo((): Media[] => {
    return product.media || [];
  }, [product.media]);

  const variantImageIndex = useMemo((): number | null => {
    if (!selectedVariant) return null;
    const index = galleryImages.findIndex((m) =>
      m.variant_ids.includes(selectedVariant.id),
    );
    return index >= 0 ? index : null;
  }, [selectedVariant, galleryImages]);

  const price = selectedVariant?.price ?? product.price;
  const originalPrice =
    selectedVariant?.original_price ?? product.original_price;
  const displayPrice = price?.display_amount;

  const currentAmountCents = price?.amount_in_cents;
  const originalAmountCents = originalPrice?.amount_in_cents;
  const compareAtAmountCents = price?.compare_at_amount_in_cents;
  const onSale =
    (currentAmountCents != null &&
      originalAmountCents != null &&
      currentAmountCents < originalAmountCents) ||
    (compareAtAmountCents != null &&
      currentAmountCents != null &&
      currentAmountCents < compareAtAmountCents);

  const strikethroughPrice = onSale
    ? ((originalPrice?.display_amount &&
      originalPrice.display_amount !== displayPrice
        ? originalPrice.display_amount
        : price?.display_compare_at_amount) ?? null)
    : null;

  const sku = selectedVariant?.sku ?? product.default_variant?.sku;

  const isPurchasable = hasVariants
    ? (selectedVariant?.purchasable ?? false)
    : (product.purchasable ?? false);

  const inStock = hasVariants
    ? (selectedVariant?.in_stock ?? false)
    : (product.in_stock ?? false);

  const busy = loading || uploading || updating;

  const handleAddToCart = async () => {
    const variantId =
      selectedVariant?.id ||
      product.default_variant?.id ||
      product.default_variant_id;
    if (!variantId) {
      throw new Error("No variant selected");
    }

    if (hasPersonalization) {
      const clientErrors = validatePersonalizationAnswers(
        personalizationFields,
        personalizationAnswers,
      );
      if (clientErrors.length > 0) {
        setPersonalizationErrors(clientErrors);
        toast.error(tp("fixErrors"));
        return;
      }
      setPersonalizationErrors([]);
    }

    const payload = hasPersonalization
      ? buildPersonalizationPayload(
          personalizationFields,
          personalizationAnswers,
        )
      : undefined;

    setLoading(true);
    const result = await addItem(
      variantId,
      quantity,
      payload,
      sellerShopDiscovery,
    );
    setLoading(false);

    if (!result.success) {
      if (hasPersonalization) {
        const mapped = mapServerPersonalizationErrors(
          personalizationFields,
          result.details as Record<string, unknown> | undefined,
          result.error,
        );
        if (mapped.length > 0) setPersonalizationErrors(mapped);
      }
      toast.error(result.error || tp("addFailed"));
      return;
    }

    trackAddToCart(product, selectedVariant, quantity, currency);
  };

  const baseUnitAmount =
    currentAmountCents != null ? currentAmountCents / 100 : null;

  return (
    <div
      data-theme-product-sticky-cart={stickyCart ? "true" : "false"}
      className={`mx-auto w-full px-4 pb-12 pt-5 sm:px-6 sm:pt-8 lg:px-10 lg:pb-16 ${appearance.layout === "wide" ? "max-w-none" : "max-w-[1440px]"}`}
    >
      {themeSettingEnabled(appearance.product_navigation) &&
      (productNavigation?.previous || productNavigation?.next) ? (
        <nav
          aria-label="Product navigation"
          data-theme-product-navigation
          className="mb-6 flex items-center justify-between gap-4 border-b border-marketplace-border/70 pb-4 text-sm"
        >
          {productNavigation.previous ? (
            <Link
              href={`${basePath}/products/${productNavigation.previous.slug}`}
              rel="prev"
              className="min-w-0 truncate text-marketplace-muted-foreground hover:text-marketplace-foreground"
            >
              ← Previous: {productNavigation.previous.name}
            </Link>
          ) : (
            <span />
          )}
          {productNavigation.next ? (
            <Link
              href={`${basePath}/products/${productNavigation.next.slug}`}
              rel="next"
              className="min-w-0 truncate text-right text-marketplace-muted-foreground hover:text-marketplace-foreground"
            >
              Next: {productNavigation.next.name} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
      <div
        className="product-theme-grid grid grid-cols-1 items-start"
        style={
          {
            "--product-media-width": `${Math.max(35, Math.min(75, Number(appearance.product_media_width) || 62))}%`,
            "--product-column-gap": `${Math.max(0, Number(appearance.product_desktop_spacing) || 24)}px`,
            "--product-mobile-gap": `${Math.max(0, Number(appearance.product_mobile_spacing) || 16)}px`,
          } as CSSProperties
        }
      >
        {(templateBlocks === undefined ||
          templateMediaSettings !== undefined) && (
          <div
            className="min-w-0 lg:sticky lg:top-24 lg:self-start"
            data-theme-product-media-block={
              templateBlocks !== undefined ? "true" : undefined
            }
            data-theme-block-id={templateMediaBlockId}
            data-theme-block-type={templateMediaBlockId ? "media" : undefined}
            style={{
              border:
                templateMediaSettings?.border_style === "solid"
                  ? "1px solid var(--marketplace-border)"
                  : undefined,
              backgroundColor:
                appearance.media_background === "default"
                  ? "var(--marketplace-surface-subtle)"
                  : typeof appearance.media_background === "string" &&
                      /^#[0-9a-fA-F]{6}$/.test(appearance.media_background)
                    ? appearance.media_background
                    : undefined,
              borderRadius:
                typeof appearance.media_radius === "number"
                  ? `${appearance.media_radius}px`
                  : typeof templateMediaSettings?.corner_radius === "number"
                    ? `${templateMediaSettings.corner_radius}px`
                    : undefined,
              paddingTop:
                typeof templateMediaSettings?.padding_top === "number"
                  ? templateMediaSettings.padding_top
                  : undefined,
              paddingBottom:
                typeof templateMediaSettings?.padding_bottom === "number"
                  ? templateMediaSettings.padding_bottom
                  : undefined,
              paddingLeft:
                typeof templateMediaSettings?.padding_left === "number"
                  ? templateMediaSettings.padding_left
                  : undefined,
              paddingRight:
                typeof templateMediaSettings?.padding_right === "number"
                  ? templateMediaSettings.padding_right
                  : undefined,
            }}
          >
            <MediaGallery
              images={galleryImages}
              productName={product.name}
              productId={product.id}
              variantId={selectedVariant?.id}
              activeIndex={
                themeSettingEnabled(globalSettings.show_variant_gallery, true)
                  ? variantImageIndex
                  : undefined
              }
              thumbnailPosition={galleryStyle}
              imageRatio={
                templateMediaSettings?.aspect_ratio === "portrait"
                  ? "portrait"
                  : templateMediaSettings?.aspect_ratio === "square"
                    ? "square"
                    : imageRatio
              }
            />
          </div>
        )}

        <div
          className="mx-auto w-full min-w-0 max-w-xl lg:ml-0 lg:max-w-none lg:pt-0"
          data-theme-product-sticky-info={
            themeSettingEnabled(appearance.sticky_info) ? "true" : "false"
          }
        >
          {templateBlocks !== undefined ? (
            <ProductPageBlocksProvider
              product={product}
              value={{
                selectedVariant,
                setSelectedVariant,
                quantity,
                setQuantity,
                personalizationFields,
                personalizationAnswers,
                setPersonalizationAnswers,
                personalizationErrors,
                personalizationBusy: busy,
                personalizationUploading: setUploading,
                displayPrice,
                currency,
                baseUnitAmount,
                onAddToCart: handleAddToCart,
                basePath,
                fixedQuantity,
              }}
            >
              <div data-theme-product-block-layout className="space-y-5">
                {templateBlocks}
              </div>
              {sizeChartSettings &&
              themeSettingEnabled(sizeChartSettings.enabled) &&
              themeSettingEnabled(globalSettings.show_size_chart, true) &&
              optionTypes.some(
                (option) =>
                  option.label.toLowerCase() ===
                  String(sizeChartSettings.option_name || "size").toLowerCase(),
              ) ? (
                <details className="rounded-lg border border-gray-200 p-4">
                  <summary className="cursor-pointer font-medium">
                    {String(sizeChartSettings.title || "Size chart")}
                  </summary>
                  {sizeChartSettings.image_url ? (
                    <img
                      src={String(sizeChartSettings.image_url)}
                      alt={String(sizeChartSettings.title || "Size chart")}
                      className="mt-3 max-h-96 w-auto"
                    />
                  ) : null}
                  {sizeChartSettings.content ? (
                    <p className="mt-3 whitespace-pre-line text-sm text-gray-600">
                      {String(sizeChartSettings.content)}
                    </p>
                  ) : null}
                </details>
              ) : null}
              {!templateDescriptionBlockPresent && product.description_html ? (
                <div className="border-t pt-6">
                  <h2 className="mb-4 text-lg font-medium text-gray-900">
                    {t("description")}
                  </h2>
                  <div
                    className="prose prose-sm max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: product.description_html,
                    }}
                  />
                </div>
              ) : null}
              {!templateDescriptionBlockPresent ? (
                <ProductCustomFields customFields={product.custom_fields} />
              ) : null}
              {!templateDescriptionBlockPresent &&
              (sku || selectedVariant?.options_text) ? (
                <div className="border-t pt-6">
                  <h2 className="mb-4 text-lg font-medium text-gray-900">
                    {t("details")}
                  </h2>
                  <dl className="space-y-3">
                    {sku ? (
                      <div className="flex">
                        <dt className="w-32 text-sm text-gray-500">
                          {t("sku")}
                        </dt>
                        <dd className="text-sm text-gray-900">{sku}</dd>
                      </div>
                    ) : null}
                    {selectedVariant?.options_text ? (
                      <div className="flex">
                        <dt className="w-32 text-sm text-gray-500">
                          {t("options")}
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {selectedVariant.options_text}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              ) : null}
              {themeSettingEnabled(appearance.show_share, true) &&
              themeSettingEnabled(social?.share_products) ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm font-medium text-marketplace-brand hover:underline"
                  onClick={() => {
                    const url = window.location.href;
                    if (navigator.share)
                      void navigator
                        .share({ title: product.name, url })
                        .catch(() => undefined);
                    else if (navigator.clipboard)
                      void navigator.clipboard
                        .writeText(url)
                        .then(() => toast.success("Product link copied"));
                  }}
                >
                  <Share2 className="size-4" aria-hidden="true" />
                  Share product
                </button>
              ) : null}
            </ProductPageBlocksProvider>
          ) : (
            <>
              <h1 className="font-display text-xl leading-snug tracking-[-0.025em] text-marketplace-foreground sm:text-2xl">
                {product.name}
              </h1>

              {themeSettingEnabled(appearance.show_reviews, true) &&
              themeSettingEnabled(globalSettings.show_reviews, true) &&
              product.reviews_count > 0 &&
              product.average_rating != null ? (
                <a
                  href="#reviews"
                  className="mt-3 inline-flex flex-wrap items-center gap-2 text-sm text-marketplace-muted-foreground hover:text-marketplace-foreground"
                >
                  <StarRatingDisplay
                    rating={product.average_rating}
                    size="sm"
                  />
                  <span>
                    {tr("reviewCount", { count: product.reviews_count })}
                  </span>
                </a>
              ) : null}

              <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-y border-marketplace-border/70 py-4">
                {displayPrice ? (
                  <span className="text-2xl font-semibold tracking-tight text-marketplace-foreground sm:text-[1.75rem]">
                    {displayPrice}
                  </span>
                ) : (
                  <HiddenPricePrompt className="inline-flex items-center gap-1.5 text-base font-medium text-slate-600 underline underline-offset-4 hover:text-slate-900" />
                )}
                {onSale && strikethroughPrice && (
                  <>
                    <span className="text-lg text-marketplace-muted-foreground line-through">
                      {strikethroughPrice}
                    </span>
                    <span className="rounded-full bg-marketplace-sale/10 px-3 py-1 text-xs font-semibold text-marketplace-sale">
                      {t("sale")}
                    </span>
                  </>
                )}
              </div>

              <div className="mt-5">
                {inStock ? (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-marketplace-foreground">
                    <CircleCheckBig className="size-4 text-emerald-700" />
                    {t("inStock")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-marketplace-sale">
                    <CircleX className="size-4" />
                    {t("outOfStock")}
                  </span>
                )}
              </div>

              {hasVariants && optionTypes.length > 0 && (
                <div className="mt-5 border-t border-marketplace-border/70 pt-4">
                  <VariantPicker
                    variants={variants}
                    optionTypes={optionTypes}
                    selectedVariant={selectedVariant}
                    onVariantChange={setSelectedVariant}
                    swatchSettings={{
                      ...swatchSettings,
                      enabled:
                        themeSettingEnabled(swatchSettings?.enabled) &&
                        themeSettingEnabled(globalSettings.show_swatches, true),
                    }}
                  />
                </div>
              )}

              {sizeChartSettings &&
              themeSettingEnabled(sizeChartSettings.enabled) &&
              themeSettingEnabled(globalSettings.show_size_chart, true) &&
              optionTypes.some(
                (option) =>
                  option.label.toLowerCase() ===
                  String(sizeChartSettings.option_name || "size").toLowerCase(),
              ) ? (
                <details className="mt-5 border-y border-marketplace-border/70 py-4">
                  <summary className="cursor-pointer font-medium">
                    {String(sizeChartSettings.title || "Size chart")}
                  </summary>
                  {sizeChartSettings.image_url ? (
                    <img
                      src={String(sizeChartSettings.image_url)}
                      alt={String(sizeChartSettings.title || "Size chart")}
                      className="mt-3 max-h-96 w-auto"
                    />
                  ) : null}
                  {sizeChartSettings.content ? (
                    <p className="mt-3 whitespace-pre-line text-sm text-gray-600">
                      {String(sizeChartSettings.content)}
                    </p>
                  ) : null}
                </details>
              ) : null}

              <div
                data-theme-product-purchase
                className="mt-7 rounded-[var(--marketplace-radius-md)] border border-marketplace-border bg-marketplace-surface-subtle/70 p-4 sm:p-5"
              >
                <p className="mb-4 text-xs text-marketplace-muted-foreground">
                  {t("taxesCalculatedAtCheckout")}
                </p>
                {pricesHidden ? (
                  <Button asChild size="lg">
                    <Link href={hiddenPricing.signInHref}>
                      {tw("hiddenPrice.signInToOrder")}
                    </Link>
                  </Button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-3">
                      {!fixedQuantity && (
                        <QuantityPickerField
                          quantity={quantity}
                          onQuantityChange={setQuantity}
                          size="lg"
                          variant="dropdown"
                        />
                      )}

                      <Button
                        size="lg"
                        onClick={() => void handleAddToCart()}
                        disabled={busy || !isPurchasable}
                        className="w-full rounded-full bg-marketplace-brand text-marketplace-brand-foreground hover:bg-marketplace-brand/90 sm:flex-1"
                      >
                        {busy ? (
                          <>
                            <Loader2 className="animate-spin h-5 w-5" />
                            {uploading ? tp("uploading") : t("adding")}
                          </>
                        ) : isPurchasable ? (
                          <>
                            <ShoppingBag className="w-5 h-5" />
                            {t("addToCart")}
                          </>
                        ) : (
                          t("outOfStock")
                        )}
                      </Button>
                    </div>
                    {product.seller?.accepts_custom_orders &&
                    product.seller_id &&
                    productStatus !== "private" ? (
                      <RequestCustomOrderForm
                        sellerId={product.seller_id}
                        basePath={basePath}
                        sourceProductId={product.id}
                        sourceProductName={product.name}
                        ctaLabel={tc("requestCustomVersion")}
                      />
                    ) : null}
                  </div>
                )}
              </div>

              {themeSettingEnabled(appearance.show_share, true) &&
                themeSettingEnabled(social?.share_products) && (
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-marketplace-brand hover:underline"
                    onClick={() => {
                      const url = window.location.href;
                      if (navigator.share) {
                        void navigator
                          .share({ title: product.name, url })
                          .catch(() => undefined);
                      } else if (navigator.clipboard) {
                        void navigator.clipboard
                          .writeText(url)
                          .then(() => toast.success("Product link copied"));
                      }
                    }}
                  >
                    <Share2 className="size-4" aria-hidden="true" />
                    Share product
                  </button>
                )}
              {product.description_html ? (
                <details className="mt-7 border-t border-marketplace-border/70 py-4">
                  <summary className="cursor-pointer list-none font-medium text-marketplace-foreground marker:hidden">
                    <span className="flex items-center justify-between">
                      {t("description")}
                      <span
                        aria-hidden="true"
                        className="text-lg text-marketplace-muted-foreground"
                      >
                        +
                      </span>
                    </span>
                  </summary>
                  <div
                    className="prose prose-sm mt-4 max-w-none leading-6 text-marketplace-muted-foreground prose-headings:font-display prose-headings:font-medium prose-headings:text-marketplace-foreground prose-a:text-marketplace-brand"
                    dangerouslySetInnerHTML={{
                      __html: product.description_html,
                    }}
                  />
                </details>
              ) : null}
              {sku ||
              selectedVariant?.options_text ||
              product.custom_fields?.length ? (
                <details className="border-y border-marketplace-border/70 py-4">
                  <summary className="cursor-pointer list-none font-medium text-marketplace-foreground marker:hidden">
                    <span className="flex items-center justify-between">
                      {t("details")}
                      <span
                        aria-hidden="true"
                        className="text-lg text-marketplace-muted-foreground"
                      >
                        +
                      </span>
                    </span>
                  </summary>
                  <dl className="mt-3 divide-y divide-marketplace-border/70">
                    {sku ? (
                      <div className="flex gap-4 py-3 text-sm">
                        <dt className="w-24 shrink-0 text-marketplace-muted-foreground">
                          {t("sku")}
                        </dt>
                        <dd className="text-marketplace-foreground">{sku}</dd>
                      </div>
                    ) : null}
                    {selectedVariant?.options_text ? (
                      <div className="flex gap-4 py-3 text-sm">
                        <dt className="w-24 shrink-0 text-marketplace-muted-foreground">
                          {t("options")}
                        </dt>
                        <dd className="text-marketplace-foreground">
                          {selectedVariant.options_text}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                  {product.custom_fields?.length ? (
                    <ProductCustomFields customFields={product.custom_fields} />
                  ) : null}
                </details>
              ) : null}
            </>
          )}
        </div>
      </div>
      {templateBlocks === undefined && product.categories?.length ? (
        <nav
          aria-label="Related categories"
          className="mt-8 border-t border-marketplace-border/70 pt-6"
        >
          <ul className="flex flex-wrap gap-2">
            {product.categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`${basePath}/c/${category.permalink}`}
                  className="inline-flex min-h-9 items-center rounded-md border border-marketplace-border bg-marketplace-surface px-3 text-xs font-medium text-marketplace-foreground transition-colors hover:border-marketplace-brand hover:text-marketplace-brand"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
