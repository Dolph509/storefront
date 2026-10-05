const STORAGE_KEY = "spree.deliveryDestination";

export interface DeliveryDestination {
  countryCode: string;
  postalCode: string;
  stateCode?: string;
  city?: string;
  /** True when the shopper chose a destination in Deliver to (keep over account address). */
  manual?: boolean;
}

export function readDeliveryDestination(
  fallbackCountry: string,
): DeliveryDestination {
  if (typeof window === "undefined") {
    return { countryCode: fallbackCountry, postalCode: "" };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { countryCode: fallbackCountry, postalCode: "" };
    const parsed = JSON.parse(raw) as Partial<DeliveryDestination>;
    return {
      countryCode: (parsed.countryCode || fallbackCountry).toLowerCase(),
      postalCode: String(parsed.postalCode || "").trim(),
      stateCode: parsed.stateCode?.toUpperCase() || undefined,
      city: parsed.city?.trim() || undefined,
      manual: Boolean(parsed.manual),
    };
  } catch {
    return { countryCode: fallbackCountry, postalCode: "" };
  }
}

export function writeDeliveryDestination(
  destination: DeliveryDestination,
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      countryCode: destination.countryCode.toLowerCase(),
      postalCode: destination.postalCode.trim(),
      stateCode: destination.stateCode?.toUpperCase() || undefined,
      city: destination.city?.trim() || undefined,
      manual: Boolean(destination.manual),
    }),
  );
  window.dispatchEvent(
    new CustomEvent("spree:delivery-destination", { detail: destination }),
  );
}

/** Prefer a saved account address unless the shopper picked a Deliver-to ZIP. */
export function mergeCustomerDestination(
  local: DeliveryDestination,
  customer: DeliveryDestination | null | undefined,
): DeliveryDestination {
  if (!customer?.countryCode) return local;
  if (local.manual && local.postalCode) return local;
  if (!customer.postalCode && local.postalCode) return local;
  return { ...customer, manual: false };
}

export function formatDeliveryDestinationLabel(
  destination: DeliveryDestination,
  countryName: string,
): string {
  const cityState = [destination.city, destination.stateCode]
    .filter(Boolean)
    .join(", ");
  const place = [cityState || countryName, destination.postalCode]
    .filter(Boolean)
    .join(" ");
  return place || countryName;
}
