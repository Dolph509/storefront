"use client";

import type { Product } from "@spree/sdk";
import {
  Calendar,
  ChevronDown,
  Hammer,
  MapPin,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useTranslations as useUiTranslations } from "next-intl";
import type { ReactNode } from "react";
import { QuantityPickerField } from "@/components/cart/QuantityPickerField";
import { RegionPreferences } from "@/components/layout/RegionPreferences";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { HiddenPricePrompt } from "@/components/products/HiddenPricePrompt";
import { MadeTogetherCollective } from "@/components/products/MadeTogetherCollective";
import { MadeTogetherMakerAvatar } from "@/components/products/MadeTogetherMakerAvatar";
import { MakeOfferButton } from "@/components/products/MakeOfferButton";
import { PersonalizationProofNotice } from "@/components/products/PersonalizationProofNotice";
import { ProductBundleOffer } from "@/components/products/ProductBundleOffer";
import { ProductBuyNowExpress } from "@/components/products/ProductBuyNowExpress";
import { ProductMobileStickyPurchaseBar } from "@/components/products/ProductMobileStickyPurchaseBar";
import { ProductOrderMinimumDeal } from "@/components/products/ProductOrderMinimumDeal";
import { ProductPersonalizationForm } from "@/components/products/ProductPersonalizationForm";
import { ProductShippingCost } from "@/components/products/ProductShippingCost";
import { ReportListingButton } from "@/components/products/ReportListingButton";
import { useProductStickyPurchaseBar } from "@/components/products/useProductStickyPurchaseBar";
import { StarSellerAvatar } from "@/components/shops/StarSellerAvatar";
import { Button } from "@/components/ui/button";
import type { CartDiscoveryInput } from "@/lib/discovery-context";
import type { MadeTogetherPresentation } from "@/lib/made-together/types";
import { themeSettingEnabled } from "@/lib/theme/setting-value";
import { sellerDisplayName } from "@/lib/utils/seller-display";
import { OddkeepsProductHighlights } from "./OddkeepsProductHighlights";
import { OddkeepsReferenceGallery } from "./OddkeepsReferenceGallery";
import { OddkeepsReferenceVariantPicker } from "./OddkeepsReferenceVariantPicker";
import styles from "./oddkeeps-reference.module.css";
import { useProductDetailCommerce } from "./use-product-detail-commerce";

function formatCompactCount(count: number, locale: string): string {
  if (count < 1000) return count.toLocaleString(locale);
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(count);
}

export type OddkeepsReferenceProductPageProps = {
  product: Product;
  basePath: string;
  cartDiscovery?: CartDiscoveryInput;
  madeTogether?: MadeTogetherPresentation | null;
  fixedQuantity?: boolean;
  appearance?: Record<string, unknown>;
  globalSettings?: Record<string, string | boolean>;
  hasFollowingDiscovery?: boolean;
  /** Optional server-computed rating summary when product payload lacks aggregates. */
  reviewSummary?: { average: number | null; count: number };
  children?: ReactNode;
};

export function OddkeepsReferenceProductPage(
  props: OddkeepsReferenceProductPageProps,
) {
  const commerce = useProductDetailCommerce(props);
  const tCommon = useUiTranslations("common");
  const { purchaseRef, showSticky: showMobileStickyPurchase } =
    useProductStickyPurchaseBar(true);

  const {
    locale,
    t,
    tw,
    product,
    basePath,
    fixedQuantity,
    pricesHidden,
    hiddenPricing,
    seller,
    sellerShopHref,
    showVendor,
    hasVariants,
    optionTypes,
    variants,
    selectedVariant,
    setSelectedVariant,
    quantity,
    setQuantity,
    bundleOffer,
    orderMinimumDeal,
    personalizationFields,
    hasPersonalization,
    personalizationOptional,
    personalizationOpen,
    setPersonalizationOpen,
    personalizationAnswers,
    setPersonalizationAnswers,
    personalizationErrors,
    galleryImages,
    variantImageIndex,
    displayPrice,
    strikethroughPrice,
    salePercent,
    pdpMerchandising,
    sellerRating,
    sellerReviewCount,
    isPurchasable,
    busy,
    purchaseReady,
    productReviewCount,
    productAverageRating,
    baseUnitAmount,
    currency,
    estimatedDeliveryRange,
    returnsSummaryCompact,
    hasReturnPolicyDisclosure,
    sizeChartSettings,
    globalSettings,
    setUploading,
    handleAddToCart,
    handleBuyNow,
    prepareCheckoutCart,
    buyNowPreviewAmountCents,
    buyNowConfigurationKey,
  } = commerce;

  const headerRating =
    sellerRating ??
    productAverageRating ??
    props.reviewSummary?.average ??
    null;
  const headerReviewCount =
    sellerRating != null
      ? sellerReviewCount
      : productReviewCount > 0
        ? productReviewCount
        : (props.reviewSummary?.count ?? 0);

  const urgencySignal =
    pdpMerchandising.availability[0] ??
    pdpMerchandising.price[0] ??
    pdpMerchandising.title[0] ??
    null;

  const quickFacts: Array<{
    key: string;
    icon: "hammer" | "package";
    text: string;
  }> = [];
  if (
    product.handmade_verified ||
    product.seller?.accepts_custom_orders ||
    hasPersonalization
  ) {
    quickFacts.push({
      key: "made",
      icon: "hammer",
      text: t("madeToOrder"),
    });
  }
  if (estimatedDeliveryRange) {
    quickFacts.push({
      key: "ships",
      icon: "package",
      text: estimatedDeliveryRange,
    });
  }

  return (
    <div
      data-theme-product-page
      data-product-page-mode="oddkeeps"
      data-storefront-oddkeeps-reference-pdp
      className={styles.page}
    >
      <div
        className={`${styles.container} ${props.hasFollowingDiscovery ? "pb-0" : "pb-24 md:pb-16"}`}
      >
        <div className={styles.hero}>
          <div className={styles.leftColumn}>
            <div className={styles.galleryArea}>
              <OddkeepsReferenceGallery
                images={galleryImages}
                productName={product.name}
                productId={product.id}
                variantId={selectedVariant?.id}
                activeIndex={
                  themeSettingEnabled(globalSettings.show_variant_gallery, true)
                    ? variantImageIndex
                    : undefined
                }
                onShare={commerce.shareProduct}
              />
            </div>

            <div className={styles.detailsArea}>
              <OddkeepsProductHighlights
                product={product}
                selectedVariant={selectedVariant}
                sku={
                  selectedVariant?.sku ?? product.default_variant?.sku ?? null
                }
                relevanceSignals={pdpMerchandising.relevance}
                madeTogether={props.madeTogether}
              />
            </div>
          </div>

          <div className={styles.rightColumn} data-pdp-buy-column>
            <div className={styles.buyTopArea}>
              {props.madeTogether && props.madeTogether.makers.length > 1 ? (
                <div className={styles.shopRow} data-made-together-byline>
                  <div className="flex shrink-0 items-center">
                    {props.madeTogether.makers
                      .slice(0, 3)
                      .map((maker, index) => (
                        <span
                          key={maker.key}
                          className={`inline-flex rounded-full ${index > 0 ? "-ml-1" : ""}`}
                          style={{ zIndex: 3 - index }}
                        >
                          <MadeTogetherMakerAvatar
                            name={maker.name}
                            logoUrl={maker.logoUrl}
                            href={maker.href}
                            variantIndex={index}
                            className="size-7 text-[10px]"
                            ringClassName="ring-2 ring-white"
                          />
                        </span>
                      ))}
                  </div>
                  <span className="flex flex-wrap items-center gap-x-1">
                    {props.madeTogether.makers.map((maker, index) => (
                      <span
                        key={maker.key}
                        className="inline-flex items-center gap-1"
                      >
                        {index > 0 ? (
                          <span className="text-[#8a8680]" aria-hidden>
                            &amp;
                          </span>
                        ) : null}
                        {maker.href ? (
                          <Link href={maker.href} className={styles.shopLink}>
                            {sellerDisplayName(maker.name)}
                          </Link>
                        ) : (
                          <span className="font-medium text-[#1a1a1a]">
                            {sellerDisplayName(maker.name)}
                          </span>
                        )}
                      </span>
                    ))}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(
                        "made-together-collective",
                      );
                      if (el instanceof HTMLDetailsElement) el.open = true;
                      el?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                    className="inline-flex cursor-pointer items-center gap-1.5 bg-transparent p-0 text-[13px] font-normal text-[#6f6c68] transition-colors hover:text-[#1a1a1a]"
                  >
                    <span
                      className="hidden text-[#cbc7c1] sm:inline"
                      aria-hidden
                    >
                      |
                    </span>
                    <span>{t("creativeCollaborative")}</span>
                  </button>
                  {headerRating != null && headerReviewCount > 0 ? (
                    <a href="#reviews" className={styles.shopRating}>
                      <span className="mr-0.5 text-[#cbc7c1]" aria-hidden>
                        |
                      </span>
                      <span>{Number(headerRating).toFixed(1)}</span>
                      <Star
                        className="size-3.5 fill-[#1b4332] text-[#1b4332]"
                        aria-hidden
                      />
                      <span className={styles.shopRatingCount}>
                        ({formatCompactCount(headerReviewCount, locale)})
                      </span>
                    </a>
                  ) : null}
                </div>
              ) : showVendor && seller && sellerShopHref ? (
                <div className={styles.shopRow}>
                  <StarSellerAvatar
                    seller={{
                      ...seller,
                      name: sellerDisplayName(seller.name),
                    }}
                    href={sellerShopHref}
                    sizeClassName="size-7"
                    imageSizes="28px"
                  />
                  <Link href={sellerShopHref} className={styles.shopLink}>
                    {sellerDisplayName(seller.name)}
                  </Link>
                  {headerRating != null && headerReviewCount > 0 ? (
                    <>
                      <span className={styles.pipe} aria-hidden>
                        |
                      </span>
                      <a href="#reviews" className={styles.shopRating}>
                        <span>{Number(headerRating).toFixed(1)}</span>
                        <Star
                          className="size-3.5 fill-[#1b4332] text-[#1b4332]"
                          aria-hidden
                        />
                        <span className={styles.shopRatingCount}>
                          ({formatCompactCount(headerReviewCount, locale)})
                        </span>
                      </a>
                    </>
                  ) : null}
                </div>
              ) : null}

              <h1 className={`font-sans ${styles.title}`}>{product.name}</h1>

              <div className={styles.priceStack}>
                {urgencySignal ? (
                  <p
                    className={styles.urgencySignal}
                    data-merchandising-pdp-signal={urgencySignal.key}
                  >
                    {urgencySignal.label}
                  </p>
                ) : null}
                <div className={styles.priceRow}>
                  {displayPrice ? (
                    <span className={styles.price}>
                      {displayPrice}
                      {hasPersonalization ? "+" : ""}
                    </span>
                  ) : (
                    <HiddenPricePrompt className="underline underline-offset-4" />
                  )}
                  {strikethroughPrice ? (
                    <span className={styles.priceCompare}>
                      {strikethroughPrice}
                      {hasPersonalization ? "+" : ""}
                    </span>
                  ) : null}
                </div>
                {salePercent != null ? (
                  <p
                    className={styles.saleSavings}
                    data-merchandising-pdp-signal="sale"
                  >
                    {t("limitedTimeSale", { percent: salePercent })}
                  </p>
                ) : null}
              </div>

              {quickFacts.length > 0 ? (
                <div className={styles.quickFacts}>
                  {quickFacts.map((fact, idx) => (
                    <span
                      key={fact.key}
                      className="inline-flex items-center gap-3"
                    >
                      {idx > 0 ? (
                        <span className={styles.pipe} aria-hidden>
                          |
                        </span>
                      ) : null}
                      <span className={styles.quickFactItem}>
                        {fact.icon === "hammer" ? (
                          <Hammer
                            className="size-3.5 shrink-0 text-[#4a4743]"
                            aria-hidden
                          />
                        ) : (
                          <Package
                            className="size-3.5 shrink-0 text-[#4a4743]"
                            aria-hidden
                          />
                        )}
                        <span>{fact.text}</span>
                      </span>
                    </span>
                  ))}
                </div>
              ) : null}

              {orderMinimumDeal ? (
                <ProductOrderMinimumDeal
                  deal={orderMinimumDeal}
                  shopHref={sellerShopHref}
                />
              ) : null}

              {hasVariants && optionTypes.length > 0 ? (
                <OddkeepsReferenceVariantPicker
                  variants={variants}
                  optionTypes={optionTypes}
                  selectedVariant={selectedVariant}
                  onVariantChange={setSelectedVariant}
                />
              ) : null}

              {sizeChartSettings &&
              themeSettingEnabled(sizeChartSettings.enabled) &&
              themeSettingEnabled(globalSettings.show_size_chart, true) &&
              optionTypes.some(
                (option) =>
                  option.label.toLowerCase() ===
                  String(sizeChartSettings.option_name || "size").toLowerCase(),
              ) ? (
                <details className="rounded-lg border border-[#eae7e2] px-3 py-2.5">
                  <summary className="cursor-pointer text-sm font-medium text-[#1a1a1a]">
                    {String(sizeChartSettings.title || "Size chart")}
                  </summary>
                  {sizeChartSettings.image_url ? (
                    <img
                      src={String(sizeChartSettings.image_url)}
                      alt={String(sizeChartSettings.title || "Size chart")}
                      className="mt-3 max-h-80 w-auto"
                    />
                  ) : null}
                </details>
              ) : null}

              {hasPersonalization ? (
                <div className={styles.personalizeRow}>
                  {personalizationOptional ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setPersonalizationOpen((open) => !open)}
                        className={styles.personalizeToggle}
                        aria-expanded={personalizationOpen}
                      >
                        <span>{t("personalizeOptional")}</span>
                        {personalizationOpen ? (
                          <Minus
                            className="size-4 text-[#4a4743]"
                            aria-hidden
                          />
                        ) : (
                          <Plus className="size-4 text-[#4a4743]" aria-hidden />
                        )}
                      </button>
                      {personalizationOpen ? (
                        <div className="mt-3 space-y-3">
                          {product.proof_required ? (
                            <PersonalizationProofNotice />
                          ) : null}
                          <ProductPersonalizationForm
                            fields={personalizationFields}
                            answers={personalizationAnswers}
                            onChange={setPersonalizationAnswers}
                            errors={personalizationErrors}
                            disabled={busy}
                            baseDisplayPrice={displayPrice}
                            currency={currency}
                            baseUnitAmount={baseUnitAmount}
                            uploadingChange={setUploading}
                            compact
                          />
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="space-y-3">
                      {product.proof_required ? (
                        <PersonalizationProofNotice />
                      ) : null}
                      <ProductPersonalizationForm
                        fields={personalizationFields}
                        answers={personalizationAnswers}
                        onChange={setPersonalizationAnswers}
                        errors={personalizationErrors}
                        disabled={busy}
                        baseDisplayPrice={displayPrice}
                        currency={currency}
                        baseUnitAmount={baseUnitAmount}
                        uploadingChange={setUploading}
                        compact
                      />
                    </div>
                  )}
                </div>
              ) : null}

              {!fixedQuantity ? (
                <div className={styles.quantityBlock}>
                  <span className={styles.quantityLabel}>
                    {tCommon("quantity")}
                  </span>
                  <div className={styles.quantitySelectWrap}>
                    <QuantityPickerField
                      quantity={quantity}
                      onQuantityChange={setQuantity}
                      variant="dropdown"
                      disabled={!purchaseReady || busy || !isPurchasable}
                    />
                  </div>
                </div>
              ) : null}

              <div ref={purchaseRef} className={styles.ctaGroup}>
                {pricesHidden && hiddenPricing ? (
                  <Button
                    asChild
                    className="h-[54px] w-full rounded-full text-base font-semibold"
                  >
                    <Link href={hiddenPricing.signInHref}>
                      {tw("hiddenPrice.signInToOrder")}
                    </Link>
                  </Button>
                ) : (
                  <>
                    <AddToCartButton
                      onAdd={handleAddToCart}
                      disabled={!purchaseReady}
                      pending={busy}
                      isPurchasable={isPurchasable}
                      unavailableLabel={t("outOfStock")}
                    />
                    <div
                      className={
                        product.buyer_offers_available && isPurchasable
                          ? "grid w-full grid-cols-2 gap-2.5 md:flex md:flex-col md:gap-3"
                          : "w-full"
                      }
                    >
                      <ProductBuyNowExpress
                        basePath={basePath}
                        currency={currency}
                        previewAmountCents={buyNowPreviewAmountCents}
                        configurationKey={buyNowConfigurationKey}
                        prepareCart={prepareCheckoutCart}
                        onBuyNowFallback={handleBuyNow}
                        disabled={!purchaseReady || busy || !isPurchasable}
                        layout="oddkeeps"
                        className={styles.expressBuyNow}
                        fallbackClassName={styles.btnBuyNow}
                      />
                      {product.buyer_offers_available && isPurchasable ? (
                        <div className="w-full [&_a]:!h-[46px] [&_a]:!rounded-full [&_a]:!border-[1.5px] [&_a]:!border-[#d4d1cc] [&_a]:!bg-white [&_a]:!text-[14.5px] [&_a]:!font-semibold [&_a]:!text-[#1a1a1a] [&_a]:hover:!bg-[#f6f4f0] [&_button]:!h-[46px] [&_button]:!rounded-full [&_button]:!border-[1.5px] [&_button]:!border-[#d4d1cc] [&_button]:!bg-white [&_button]:!text-[14.5px] [&_button]:!font-semibold [&_button]:!text-[#1a1a1a] [&_button]:hover:!bg-[#f6f4f0] md:[&_a]:!h-[52px] md:[&_a]:!text-[15.5px] md:[&_button]:!h-[52px] md:[&_button]:!text-[15.5px]">
                          <MakeOfferButton
                            variantId={
                              selectedVariant?.id || product.default_variant_id
                            }
                            available={
                              product.buyer_offers_available && isPurchasable
                            }
                            basePath={basePath}
                            currency={currency}
                          />
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
                {bundleOffer ? (
                  <div className="w-full pt-2">
                    <ProductBundleOffer
                      offer={bundleOffer}
                      currentProductId={product.id}
                      basePath={basePath}
                    />
                  </div>
                ) : null}
              </div>

              <div className={styles.trustList}>
                <div className={styles.trustItem}>
                  <ShieldCheck className={styles.trustIcon} aria-hidden />
                  <p>
                    <span className="font-semibold underline underline-offset-2">
                      {t("buyerProtectionTitle")}
                    </span>
                    {" — "}
                    <span className={styles.trustMuted}>
                      {t("buyerProtectionBody")}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.policiesArea}>
              {(() => {
                const effectiveAcceptsReturns =
                  product.accepts_returns ??
                  product.seller?.default_accepts_returns ??
                  null;
                const effectiveAcceptsExchanges =
                  product.accepts_exchanges ??
                  product.seller?.default_accepts_exchanges ??
                  null;
                const effectiveReturnWindowDays =
                  product.return_window_days ??
                  product.seller?.default_return_window_days ??
                  30;
                const showReturnPolicy =
                  hasReturnPolicyDisclosure ||
                  effectiveAcceptsReturns != null ||
                  effectiveAcceptsExchanges != null;
                const shipsFromLocation =
                  product.ships_from?.trim() ||
                  product.seller?.ships_from?.trim() ||
                  null;

                return (
                  <details open className={styles.shippingAccordion}>
                    <summary className={styles.shippingSummary}>
                      <span className="flex items-center justify-between gap-3">
                        <span>{t("shippingAndReturnPolicies")}</span>
                        <ChevronDown
                          className={`size-5 shrink-0 text-[#222222] ${styles.shippingChevron}`}
                          aria-hidden
                        />
                      </span>
                    </summary>
                    <div className="mt-4 space-y-3.5 text-[15px] leading-snug text-[#222222]">
                      <div className="flex items-start gap-3">
                        <Calendar
                          className="mt-0.5 size-[19px] shrink-0 text-[#222222]"
                          aria-hidden
                        />
                        <p>
                          {estimatedDeliveryRange
                            ? t.rich("orderTodayGetBy", {
                                range: estimatedDeliveryRange,
                                date: (chunks) => (
                                  <span className="font-semibold underline decoration-dashed decoration-[#222222]/50 underline-offset-[4px]">
                                    {chunks}
                                  </span>
                                ),
                              })
                            : t("deliveryBody")}
                        </p>
                      </div>

                      {showReturnPolicy ? (
                        <div className="flex items-start gap-3">
                          <Package
                            className="mt-0.5 size-[19px] shrink-0 text-[#222222]"
                            aria-hidden
                          />
                          <p>
                            {effectiveAcceptsReturns ||
                            effectiveAcceptsExchanges
                              ? t.rich("returnsAcceptedWithin", {
                                  days: effectiveReturnWindowDays,
                                  policy: (chunks) => (
                                    <span className="underline decoration-dashed decoration-[#222222]/50 underline-offset-[4px]">
                                      {chunks}
                                    </span>
                                  ),
                                })
                              : t("returnsAndExchangesNotAccepted")}
                          </p>
                        </div>
                      ) : returnsSummaryCompact ? (
                        <div className="flex items-start gap-3">
                          <Package
                            className="mt-0.5 size-[19px] shrink-0 text-[#222222]"
                            aria-hidden
                          />
                          <p>{returnsSummaryCompact}</p>
                        </div>
                      ) : null}

                      <div className="flex items-start gap-3">
                        <Truck
                          className="mt-0.5 size-[19px] shrink-0 text-[#222222]"
                          aria-hidden
                        />
                        <ProductShippingCost
                          productId={product.id}
                          variantId={selectedVariant?.id}
                          fallbackCost={product.shipping_cost}
                          fallbackFree={Boolean(product.free_shipping)}
                        />
                      </div>

                      {shipsFromLocation ? (
                        <div className="flex items-start gap-3">
                          <MapPin
                            className="mt-0.5 size-[19px] shrink-0 text-[#222222]"
                            aria-hidden
                          />
                          <p>
                            {t.rich("shipsFromLabel", {
                              location: shipsFromLocation,
                              place: (chunks) => (
                                <span className="font-semibold text-[#222222]">
                                  {chunks}
                                </span>
                              ),
                            })}
                          </p>
                        </div>
                      ) : null}

                      <div className={`pt-1 ${styles.shippingDeliver}`}>
                        <RegionPreferences variant="deliver" />
                      </div>
                    </div>
                  </details>
                );
              })()}

              {props.madeTogether ? (
                <MadeTogetherCollective presentation={props.madeTogether} />
              ) : null}

              <div className="hidden justify-end pt-3 text-xs md:flex">
                <ReportListingButton productId={product.id} />
              </div>
            </div>
          </div>
        </div>

        {props.children ? (
          <div className={styles.reviewsBand}>{props.children}</div>
        ) : null}
      </div>

      <ProductMobileStickyPurchaseBar
        visible={showMobileStickyPurchase && !pricesHidden}
        displayPrice={displayPrice}
        compareAtPrice={strikethroughPrice}
        busy={busy}
        isPurchasable={isPurchasable}
        purchaseReady={purchaseReady}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
