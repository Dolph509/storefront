"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import {
  estimateProductShipping,
  getCustomerShippingDestination,
} from "@/lib/data/shipping-estimates";
import {
  type DeliveryDestination,
  mergeCustomerDestination,
  readDeliveryDestination,
  writeDeliveryDestination,
} from "@/lib/delivery-destination";

interface ProductShippingCostProps {
  productId: string;
  variantId?: string | null;
  /** FlatRate fallback from the product payload when no destination quote yet. */
  fallbackCost?: string | null;
  fallbackFree?: boolean;
}

interface Quote {
  displayAmount: string;
  free: boolean;
}

export function ProductShippingCost({
  productId,
  variantId,
  fallbackCost,
  fallbackFree = false,
}: ProductShippingCostProps) {
  const t = useTranslations("products");
  const { country } = useStore();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [destination, setDestination] = useState<DeliveryDestination>(() => ({
    countryCode: country,
    postalCode: "",
  }));
  const [quote, setQuote] = useState<Quote | null>(null);
  const [pending, startTransition] = useTransition();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolveDestination() {
      const local = readDeliveryDestination(country);
      let next = local;

      if (isAuthenticated) {
        const customerDestination = await getCustomerShippingDestination();
        next = mergeCustomerDestination(local, customerDestination);
        if (
          customerDestination &&
          (!local.manual || !local.postalCode) &&
          (next.postalCode !== local.postalCode ||
            next.countryCode !== local.countryCode ||
            next.stateCode !== local.stateCode ||
            next.city !== local.city)
        ) {
          writeDeliveryDestination(next);
        }
      }

      if (!cancelled) {
        setDestination(next);
        setHydrated(true);
      }
    }

    if (authLoading) return;
    void resolveDestination();

    const sync = () => setDestination(readDeliveryDestination(country));
    window.addEventListener("spree:delivery-destination", sync);
    window.addEventListener("storage", sync);
    return () => {
      cancelled = true;
      window.removeEventListener("spree:delivery-destination", sync);
      window.removeEventListener("storage", sync);
    };
  }, [authLoading, country, isAuthenticated]);

  useEffect(() => {
    if (!hydrated || !destination.countryCode) return;

    startTransition(async () => {
      const result = await estimateProductShipping({
        productId,
        countryCode: destination.countryCode,
        postalCode: destination.postalCode || undefined,
        stateCode: destination.stateCode,
        variantId,
      });
      if (!result.success) {
        setQuote(null);
        return;
      }
      const estimate = result.estimate;
      if (estimate) {
        setQuote({
          displayAmount: estimate.display_amount,
          free: estimate.free,
        });
      } else {
        setQuote(null);
      }
    });
  }, [
    hydrated,
    productId,
    variantId,
    destination.countryCode,
    destination.postalCode,
    destination.stateCode,
  ]);

  if ((pending || !hydrated) && !quote) {
    return <p>{t("shippingCostLoading")}</p>;
  }

  if (quote?.free || (!quote && fallbackFree)) {
    return <p>{t("freeShipping")}</p>;
  }

  if (quote?.displayAmount) {
    return (
      <p>
        {t.rich("costToShip", {
          amount: quote.displayAmount,
          price: (chunks) => <span className="font-semibold">{chunks}</span>,
        })}
      </p>
    );
  }

  if (fallbackCost) {
    return (
      <p>
        {t.rich("costToShip", {
          amount: fallbackCost,
          price: (chunks) => <span className="font-semibold">{chunks}</span>,
        })}
      </p>
    );
  }

  return <p>{t("shippingCalculatedAtCheckout")}</p>;
}
