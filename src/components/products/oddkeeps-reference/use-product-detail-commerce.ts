"use client";

import type { Media, Product, Variant } from "@spree/sdk";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { MerchandisingSignal } from "@/components/products/MerchandisingBadges";
import type { BundleOffer } from "@/components/products/ProductBundleOffer";
import type { OrderMinimumDeal } from "@/components/products/ProductOrderMinimumDeal";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useHiddenPricing } from "@/contexts/HiddenPricingContext";
import { useStore } from "@/contexts/StoreContext";
import { useStoreThemeSettings } from "@/contexts/ThemeSettingsContext";
import { trackAddToCart, trackViewItem } from "@/lib/analytics/gtm";
import type { CartDiscoveryInput } from "@/lib/discovery-context";
import { selectPdpSignals } from "@/lib/merchandising/presentation";
import {
  buildPersonalizationPayload,
  mapServerPersonalizationErrors,
  type PersonalizationAnswers,
  type PersonalizationFieldError,
  validatePersonalizationAnswers,
} from "@/lib/personalization";
import { themeSettingEnabled } from "@/lib/theme/setting-value";

export type ProductDetailCommerceOptions = {
  product: Product;
  basePath: string;
  cartDiscovery?: CartDiscoveryInput;
  fixedQuantity?: boolean;
  appearance?: Record<string, unknown>;
  globalSettings?: Record<string, string | boolean>;
};

export function useProductDetailCommerce(
  options: ProductDetailCommerceOptions,
) {
  const {
    product,
    basePath,
    cartDiscovery,
    fixedQuantity = false,
    appearance = {},
    globalSettings = {},
  } = options;
  const { addItem, updating } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { currency } = useStore();
  const {
    social,
    product_swatches: swatchSettings,
    size_chart: sizeChartSettings,
  } = useStoreThemeSettings();
  const locale = useLocale();
  const t = useTranslations("products");
  const tp = useTranslations("personalization");
  const tw = useTranslations("wholesale");
  const hiddenPricing = useHiddenPricing();
  const pricesHidden = hiddenPricing !== null;

  const variants = useMemo(
    () => (product.variants || []).filter(Boolean),
    [product.variants],
  );
  const hasVariants = variants.length > 0;
  const optionTypes = product.option_types || [];
  const merchandisingSignals =
    (product as Product & { merchandising_signals?: MerchandisingSignal[] })
      .merchandising_signals ?? [];
  const bundleOffer =
    (product as Product & { bundle_offer?: BundleOffer | null }).bundle_offer ??
    null;
  const orderMinimumDeal =
    (product as Product & { order_minimum_deal?: OrderMinimumDeal | null })
      .order_minimum_deal ?? null;
  const personalizationFields = product.personalization_fields ?? [];
  const hasPersonalization = personalizationFields.length > 0;
  const personalizationOptional =
    hasPersonalization &&
    personalizationFields.every(
      (field) => !field.required || Boolean(field.visible_when_field_id),
    );
  const showVendor = themeSettingEnabled(appearance.show_vendor, true);
  const seller = product.seller;
  const sellerShopHref = seller?.slug
    ? `${basePath}/sellers/${seller.slug}`
    : null;
  const hasReturnPolicyDisclosure =
    product.accepts_returns != null || product.accepts_exchanges != null;
  const returnsSummaryCompact = (() => {
    if (!hasReturnPolicyDisclosure) return null;
    if (product.accepts_returns && product.accepts_exchanges) {
      return t("returnsAndExchangesAccepted");
    }
    if (product.accepts_returns) return t("returnsAcceptedShort");
    if (product.accepts_exchanges) return t("exchangesAccepted");
    return t("returnsAndExchangesNotAccepted");
  })();

  const estimatedDeliveryRange = useMemo(() => {
    const minimum = product.estimated_delivery_date_min;
    const maximum = product.estimated_delivery_date_max;
    if (!minimum || !maximum) return null;
    const minimumDate = new Date(`${minimum}T12:00:00`);
    const maximumDate = new Date(`${maximum}T12:00:00`);
    if (
      Number.isNaN(minimumDate.getTime()) ||
      Number.isNaN(maximumDate.getTime())
    ) {
      return null;
    }
    if (minimum === maximum) {
      return new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
      }).format(minimumDate);
    }
    const sameMonth =
      minimumDate.getFullYear() === maximumDate.getFullYear() &&
      minimumDate.getMonth() === maximumDate.getMonth();
    const sameYear = minimumDate.getFullYear() === maximumDate.getFullYear();
    if (sameMonth) {
      const monthDay = new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
      }).format(minimumDate);
      return `${monthDay}–${maximumDate.getDate()}`;
    }
    const startFormatter = new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      ...(sameYear ? {} : { year: "numeric" }),
    });
    const endFormatter = new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      ...(sameYear ? {} : { year: "numeric" }),
    });
    return `${startFormatter.format(minimumDate)}–${endFormatter.format(maximumDate)}`;
  }, [
    locale,
    product.estimated_delivery_date_max,
    product.estimated_delivery_date_min,
  ]);

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(() => {
    if (product.default_variant) return product.default_variant;
    if (hasVariants) return variants.find((v) => v.purchasable) || variants[0];
    return product.default_variant || null;
  });
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [purchaseReady, setPurchaseReady] = useState(false);
  useEffect(() => setPurchaseReady(true), []);
  const [personalizationOpen, setPersonalizationOpen] = useState(
    () => !personalizationOptional,
  );
  const [personalizationAnswers, setPersonalizationAnswers] =
    useState<PersonalizationAnswers>({});
  const [personalizationErrors, setPersonalizationErrors] = useState<
    PersonalizationFieldError[]
  >([]);

  useEffect(() => {
    trackViewItem(product, currency);
  }, [product, currency]);

  const galleryImages = useMemo(
    (): Media[] => product.media || [],
    [product.media],
  );
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
  const salePercent = (() => {
    if (!onSale || currentAmountCents == null) return null;
    const baseline =
      originalAmountCents != null && originalAmountCents > currentAmountCents
        ? originalAmountCents
        : compareAtAmountCents != null &&
            compareAtAmountCents > currentAmountCents
          ? compareAtAmountCents
          : null;
    if (baseline == null || baseline <= 0) return null;
    return Math.max(1, Math.round((1 - currentAmountCents / baseline) * 100));
  })();

  const pdpMerchandising = useMemo(() => {
    const usedKeys: string[] = [];
    const pick = (
      zone: "title" | "price" | "availability" | "seller" | "relevance",
      opts: { suppressSaleBadge?: boolean } = {},
    ) => {
      const picked = selectPdpSignals({
        signals: merchandisingSignals,
        zone,
        excludeKeys: usedKeys,
        suppressSaleBadge: opts.suppressSaleBadge,
      });
      usedKeys.push(...picked.map((signal) => signal.key));
      return picked;
    };
    return {
      title: pick("title"),
      price: pick("price", { suppressSaleBadge: salePercent != null }),
      availability: pick("availability"),
      seller: pick("seller"),
      relevance: pick("relevance"),
    };
  }, [merchandisingSignals, salePercent]);

  const sellerRating =
    seller?.average_rating != null && (seller.reviews_count ?? 0) > 0
      ? Number(seller.average_rating)
      : null;
  const sellerReviewCount =
    sellerRating != null ? (seller?.reviews_count ?? 0) : 0;
  const sku = selectedVariant?.sku ?? product.default_variant?.sku;
  const isPurchasable = hasVariants
    ? (selectedVariant?.purchasable ?? false)
    : (product.purchasable ?? false);
  const busy = loading || uploading || updating;
  const productReviewCount = product.reviews_count ?? 0;
  const productAverageRating =
    product.average_rating != null ? Number(product.average_rating) : null;
  const showProductReviewLink =
    productReviewCount > 0 &&
    productAverageRating != null &&
    Number.isFinite(productAverageRating);
  const baseUnitAmount =
    currentAmountCents != null ? currentAmountCents / 100 : null;
  const showShareControl =
    themeSettingEnabled(appearance.show_share, true) &&
    themeSettingEnabled(social?.share_products);
  const swatchConfig = {
    ...swatchSettings,
    enabled:
      themeSettingEnabled(swatchSettings?.enabled) &&
      themeSettingEnabled(globalSettings.show_swatches, true),
  };

  const addConfiguredItem = async (): Promise<string | null> => {
    const variantId =
      selectedVariant?.id ||
      product.default_variant?.id ||
      product.default_variant_id;
    if (!variantId) return null;
    if (hasPersonalization) {
      const clientErrors = validatePersonalizationAnswers(
        personalizationFields,
        personalizationAnswers,
      );
      if (clientErrors.length > 0) {
        setPersonalizationOpen(true);
        setPersonalizationErrors(clientErrors);
        toast.error(tp("fixErrors"));
        return null;
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
    const result = await addItem(variantId, quantity, payload, cartDiscovery);
    setLoading(false);
    if (!result.success) {
      if (hasPersonalization) {
        const mapped = mapServerPersonalizationErrors(
          personalizationFields,
          result.details as Record<string, unknown> | undefined,
          result.error,
        );
        if (mapped.length > 0) {
          setPersonalizationOpen(true);
          setPersonalizationErrors(mapped);
        }
      }
      toast.error(result.error || tp("addFailed"));
      return null;
    }
    trackAddToCart(product, selectedVariant, quantity, currency);
    return result.cart?.id ?? null;
  };

  const shareProduct = () => {
    const url = window.location.href;
    if (navigator.share) {
      void navigator.share({ title: product.name, url }).catch(() => undefined);
    } else if (navigator.clipboard) {
      void navigator.clipboard
        .writeText(url)
        .then(() => toast.success(t("shareProductCopied")));
    }
  };

  return {
    locale,
    t,
    tp,
    tw,
    product,
    basePath,
    fixedQuantity,
    isAuthenticated,
    hiddenPricing,
    pricesHidden,
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
    sku,
    isPurchasable,
    busy,
    purchaseReady,
    productReviewCount,
    productAverageRating,
    showProductReviewLink,
    baseUnitAmount,
    currency,
    showShareControl,
    shareProduct,
    estimatedDeliveryRange,
    returnsSummaryCompact,
    hasReturnPolicyDisclosure,
    swatchConfig,
    sizeChartSettings,
    globalSettings,
    uploading,
    setUploading,
    handleAddToCart: async () => {
      const cartId = await addConfiguredItem();
      return Boolean(cartId);
    },
    handleBuyNow: async () => {
      const cartId = await addConfiguredItem();
      if (cartId) router.push(`${basePath}/checkout/${cartId}`);
    },
  };
}
