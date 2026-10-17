"use client";

import type { Product, Variant } from "@spree/sdk";
import { Calendar, Check, MapPin, Package, Truck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { ChevronDown } from "@/components/icons";
import { RegionPreferences } from "@/components/layout/RegionPreferences";
import { ProductShippingCost } from "@/components/products/ProductShippingCost";

interface ProductPurchaseDeliveryPanelProps {
  product: Product;
  selectedVariant: Variant | null;
  /** Compact checklist above the fold (classic PDP). */
  showHighlights?: boolean;
}

export function ProductPurchaseDeliveryPanel({
  product,
  selectedVariant,
  showHighlights = true,
}: ProductPurchaseDeliveryPanelProps) {
  const locale = useLocale();
  const t = useTranslations("products");

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

  return (
    <div className="space-y-0" data-product-delivery-panel>
      {showHighlights ? (
        <ul className="space-y-2.5 text-[15px] leading-snug text-[#222]">
          <li className="flex items-start gap-2.5">
            <Check
              className="mt-0.5 size-4 shrink-0 text-[#3B67D4]"
              aria-hidden
            />
            <span>
              {estimatedDeliveryRange
                ? t.rich("arrivesSoon", {
                    range: estimatedDeliveryRange,
                    date: (chunks) => (
                      <span className="font-semibold underline decoration-dashed decoration-[#222]/40 underline-offset-[3px]">
                        {chunks}
                      </span>
                    ),
                  })
                : t("deliveryBody")}
            </span>
          </li>
          {returnsSummaryCompact ? (
            <li className="flex items-start gap-2.5">
              <Check
                className="mt-0.5 size-4 shrink-0 text-[#3B67D4]"
                aria-hidden
              />
              <span>{returnsSummaryCompact}</span>
            </li>
          ) : null}
          {product.ships_from ? (
            <li className="flex items-start gap-2.5">
              <Check
                className="mt-0.5 size-4 shrink-0 text-[#3B67D4]"
                aria-hidden
              />
              <span>
                {t.rich("shipsFromLabel", {
                  location: product.ships_from,
                  place: (chunks) => (
                    <span className="font-semibold">{chunks}</span>
                  ),
                })}
              </span>
            </li>
          ) : null}
        </ul>
      ) : null}

      <details
        className={`group border-b border-[#e1e3df] py-4 ${showHighlights ? "mt-4 border-t" : ""}`}
        open={Boolean(estimatedDeliveryRange || hasReturnPolicyDisclosure)}
      >
        <summary className="cursor-pointer list-none text-[16px] font-semibold text-[#222] marker:hidden [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-3">
            {t("shippingAndReturnPolicies")}
            <ChevronDown
              aria-hidden
              className="size-5 shrink-0 text-[#222] transition-transform group-open:rotate-180"
            />
          </span>
        </summary>
        <div className="mt-4 space-y-3.5 text-[15px] leading-snug text-[#222]">
          <div className="flex items-start gap-3">
            <Calendar
              className="mt-0.5 size-[18px] shrink-0 text-[#222]"
              aria-hidden
            />
            <p>
              {estimatedDeliveryRange
                ? t.rich("orderTodayGetBy", {
                    range: estimatedDeliveryRange,
                    date: (chunks) => (
                      <span className="font-semibold underline decoration-dashed decoration-[#222]/40 underline-offset-[3px]">
                        {chunks}
                      </span>
                    ),
                  })
                : t("deliveryBody")}
            </p>
          </div>
          {hasReturnPolicyDisclosure ? (
            <div className="flex items-start gap-3">
              <Package
                className="mt-0.5 size-[18px] shrink-0 text-[#222]"
                aria-hidden
              />
              <p>
                {product.accepts_returns || product.accepts_exchanges
                  ? t.rich("returnsAcceptedWithin", {
                      days: product.return_window_days ?? 30,
                      policy: (chunks) => (
                        <span className="font-semibold underline decoration-dashed decoration-[#222]/40 underline-offset-[3px]">
                          {chunks}
                        </span>
                      ),
                    })
                  : t("returnsAndExchangesNotAccepted")}
              </p>
            </div>
          ) : null}
          <div className="flex items-start gap-3">
            <Truck
              className="mt-0.5 size-[18px] shrink-0 text-[#222]"
              aria-hidden
            />
            <ProductShippingCost
              productId={product.id}
              variantId={selectedVariant?.id}
              fallbackCost={product.shipping_cost}
              fallbackFree={Boolean(product.free_shipping)}
            />
          </div>
          {product.ships_from ? (
            <div className="flex items-start gap-3">
              <MapPin
                className="mt-0.5 size-[18px] shrink-0 text-[#222]"
                aria-hidden
              />
              <p>
                {t.rich("shipsFromLabel", {
                  location: product.ships_from,
                  place: (chunks) => (
                    <span className="font-semibold">{chunks}</span>
                  ),
                })}
              </p>
            </div>
          ) : null}
          <div className="pt-1">
            <RegionPreferences variant="deliver" />
          </div>
        </div>
      </details>
    </div>
  );
}
