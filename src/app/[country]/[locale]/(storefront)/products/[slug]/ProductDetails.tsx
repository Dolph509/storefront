"use client";

import type { Media, Product, Variant } from "@spree/sdk";
import { CircleCheckBig, CircleX, Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { QuantityPickerField } from "@/components/cart/QuantityPickerField";
import { HiddenPricePrompt } from "@/components/products/HiddenPricePrompt";
import { MediaGallery } from "@/components/products/MediaGallery";
import { ProductCustomFields } from "@/components/products/ProductCustomFields";
import { ProductPersonalizationForm } from "@/components/products/ProductPersonalizationForm";
import { VariantPicker } from "@/components/products/VariantPicker";
import { StarRatingDisplay } from "@/components/reviews/StarRating";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useHiddenPricing } from "@/contexts/HiddenPricingContext";
import { useStore } from "@/contexts/StoreContext";
import { trackAddToCart, trackViewItem } from "@/lib/analytics/gtm";
import {
  buildPersonalizationPayload,
  mapServerPersonalizationErrors,
  type PersonalizationAnswers,
  type PersonalizationFieldError,
  validatePersonalizationAnswers,
} from "@/lib/personalization";
import { RequestCustomOrderForm } from "../../sellers/[slug]/RequestCustomOrderForm";

interface ProductDetailsProps {
  product: Product;
  basePath: string;
  fixedQuantity?: boolean;
}

export function ProductDetails({
  product,
  basePath,
  fixedQuantity = false,
}: ProductDetailsProps) {
  const { addItem, updating } = useCart();
  const { currency } = useStore();
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
    const result = await addItem(variantId, quantity, payload);
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8  py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <MediaGallery
            images={galleryImages}
            productName={product.name}
            activeIndex={variantImageIndex}
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          {product.seller ? (
            <p className="mt-2 text-sm text-gray-600">
              {t("soldBy")}{" "}
              <Link
                href={`${basePath}/sellers/${product.seller.slug}`}
                className="font-medium text-gray-900 underline-offset-4 hover:underline"
              >
                {product.seller.name}
              </Link>
              {product.seller.reviews_count > 0 &&
              product.seller.average_rating != null ? (
                <span className="ml-2 inline-flex items-center gap-1 text-gray-500">
                  <StarRatingDisplay
                    rating={product.seller.average_rating}
                    size="sm"
                  />
                  <span>({product.seller.reviews_count})</span>
                </span>
              ) : null}
            </p>
          ) : null}

          {product.reviews_count > 0 && product.average_rating != null ? (
            <a
              href="#reviews"
              className="mt-3 inline-flex flex-wrap items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <StarRatingDisplay rating={product.average_rating} size="sm" />
              <span>{tr("reviewCount", { count: product.reviews_count })}</span>
            </a>
          ) : null}

          <div className="mt-4 flex items-center gap-4">
            {displayPrice ? (
              <span className="text-3xl font-bold text-gray-900">
                {displayPrice}
              </span>
            ) : (
              <HiddenPricePrompt className="inline-flex items-center gap-1.5 text-base font-medium text-slate-600 underline underline-offset-4 hover:text-slate-900" />
            )}
            {onSale && strikethroughPrice && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  {strikethroughPrice}
                </span>
                <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {t("sale")}
                </span>
              </>
            )}
          </div>

          {product.proof_required ? (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <p className="font-medium">{tp("proofRequiredTitle")}</p>
              <p className="mt-1">{tp("proofRequiredBody")}</p>
            </div>
          ) : null}

          {product.custom_order_seller_note ? (
            <div className="mt-4 rounded-md border bg-muted/30 px-3 py-2 text-sm">
              <p className="font-medium">{tc("sellerNoteLabel")}</p>
              <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                {product.custom_order_seller_note}
              </p>
            </div>
          ) : null}

          {product.custom_order_processing_weeks_min &&
          product.custom_order_processing_weeks_max ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {tc("processingTime", {
                min: product.custom_order_processing_weeks_min,
                max: product.custom_order_processing_weeks_max,
              })}
            </p>
          ) : null}

          <div className="mt-4">
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 text-green-600">
                <CircleCheckBig className="w-5 h-5" />
                {t("inStock")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-red-600">
                <CircleX className="w-5 h-5" />
                {t("outOfStock")}
              </span>
            )}
          </div>

          {hasVariants && optionTypes.length > 0 && (
            <div className="mt-8">
              <VariantPicker
                variants={variants}
                optionTypes={optionTypes}
                selectedVariant={selectedVariant}
                onVariantChange={setSelectedVariant}
              />
            </div>
          )}

          {hasPersonalization && !pricesHidden ? (
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
            />
          ) : null}

          <div className="mt-8">
            {pricesHidden ? (
              <Button asChild size="lg">
                <Link href={hiddenPricing.signInHref}>
                  {tw("hiddenPrice.signInToOrder")}
                </Link>
              </Button>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex gap-4">
                  {!fixedQuantity && (
                    <QuantityPickerField
                      quantity={quantity}
                      onQuantityChange={setQuantity}
                      size="lg"
                    />
                  )}

                  <Button
                    size="lg"
                    onClick={() => void handleAddToCart()}
                    disabled={busy || !isPurchasable}
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
                product.status !== "private" ? (
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

          {product.description_html && (
            <div className="mt-10 border-t pt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {t("description")}
              </h2>
              <div
                className="text-gray-600 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: product.description_html,
                }}
              />
            </div>
          )}

          <ProductCustomFields customFields={product.custom_fields} />

          <div className="mt-8 border-t pt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {t("details")}
            </h2>
            <dl className="space-y-3">
              {sku && (
                <div className="flex">
                  <dt className="w-32 text-gray-500 text-sm">{t("sku")}</dt>
                  <dd className="text-gray-900 text-sm">{sku}</dd>
                </div>
              )}
              {selectedVariant?.options_text && (
                <div className="flex">
                  <dt className="w-32 text-gray-500 text-sm">{t("options")}</dt>
                  <dd className="text-gray-900 text-sm">
                    {selectedVariant.options_text}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
