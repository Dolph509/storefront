import type { Address } from "@spree/sdk";
import { headers } from "next/headers";
import { getCountry } from "@/lib/data/countries";
import { getCustomer } from "@/lib/data/customer";
import {
  buildCityStateLabel,
  formatCityStateLabel,
} from "@/lib/shops/location-label";
import { resolveLocationQuery } from "@/lib/shops/resolve-location-query";
import type {
  VisitorLocation,
  VisitorLocationSource,
} from "@/lib/shops/visitor-location-shared";

export type {
  VisitorLocation,
  VisitorLocationSource,
} from "@/lib/shops/visitor-location-shared";
export {
  filterSellersByVisitorLocation,
  productMatchesVisitorLocation,
  sellerMatchesVisitorLocation,
} from "@/lib/shops/visitor-location-shared";

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function decodeHeader(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}

function buildLabel(parts: Array<string | null | undefined>): string {
  const cityState = buildCityStateLabel(parts[0], parts[1]);
  if (cityState) return cityState;
  return parts.filter(Boolean).join(", ");
}

function tokensFromParts(parts: Array<string | null | undefined>): string[] {
  const tokens = new Set<string>();
  for (const part of parts) {
    const cleaned = clean(part);
    if (!cleaned) continue;
    tokens.add(cleaned.toLowerCase());
    for (const piece of cleaned.split(/[,\s/]+/)) {
      if (piece.length >= 2) tokens.add(piece.toLowerCase());
    }
  }
  return [...tokens];
}

function locationFromAddress(
  address: Address,
  source: VisitorLocationSource = "profile",
): VisitorLocation {
  const city = clean(address.city);
  const region = clean(address.state_code) || clean(address.state_text);
  const countryCode = clean(address.country_code)?.toLowerCase() ?? null;
  const countryName = clean(address.country_name);
  return {
    label:
      buildCityStateLabel(city, region) ||
      buildLabel([city, region || countryName]),
    city,
    region,
    countryCode,
    countryName,
    source,
    queryTokens: tokensFromParts([
      city,
      region,
      address.state_text,
      address.state_name,
      countryName,
      countryCode,
    ]),
  };
}

async function locationFromManual(near: string): Promise<VisitorLocation> {
  const resolved = await resolveLocationQuery(near);
  const label = resolved?.label || formatCityStateLabel(near) || near.trim();
  const parts = label.split(",").map((part) => part.trim());
  return {
    label,
    city: parts[0] || label,
    region: parts[1] || null,
    countryCode: null,
    countryName: null,
    source: "manual",
    queryTokens: tokensFromParts(label.split(",")),
  };
}

/**
 * Resolve where the visitor is for local shop discovery.
 * Priority: `near` override → signed-in shipping address → IP geo headers → storefront country.
 */
export async function resolveVisitorLocation(options: {
  country: string;
  near?: string | null;
}): Promise<VisitorLocation> {
  const near = clean(options.near);
  if (near) return locationFromManual(near);

  const customer = await getCustomer();
  const address =
    customer?.default_shipping_address ||
    customer?.addresses?.find((entry) => entry.is_default_shipping) ||
    customer?.default_billing_address ||
    customer?.addresses?.[0];
  if (address?.city || address?.state_code || address?.country_code) {
    return locationFromAddress(address);
  }

  const requestHeaders = await headers();
  const ipCity = decodeHeader(requestHeaders.get("x-vercel-ip-city"));
  const ipRegion = decodeHeader(
    requestHeaders.get("x-vercel-ip-country-region"),
  );
  const ipCountry =
    decodeHeader(requestHeaders.get("x-vercel-ip-country"))?.toLowerCase() ||
    decodeHeader(requestHeaders.get("cf-ipcountry"))?.toLowerCase() ||
    null;

  if (ipCity || ipRegion || ipCountry) {
    let countryName: string | null = null;
    if (ipCountry) {
      try {
        countryName = (await getCountry(ipCountry)).name;
      } catch {
        countryName = ipCountry.toUpperCase();
      }
    }
    return {
      label:
        buildCityStateLabel(ipCity, ipRegion) ||
        buildLabel([ipCity, ipRegion || countryName]),
      city: ipCity,
      region: ipRegion,
      countryCode: ipCountry,
      countryName,
      source: "network",
      queryTokens: tokensFromParts([ipCity, ipRegion, countryName, ipCountry]),
    };
  }

  let countryName: string | null = options.country.toUpperCase();
  try {
    countryName = (await getCountry(options.country)).name;
  } catch {
    // keep ISO fallback
  }

  return {
    label: countryName || options.country.toUpperCase(),
    city: null,
    region: null,
    countryCode: options.country.toLowerCase(),
    countryName,
    source: "storefront",
    queryTokens: tokensFromParts([countryName, options.country]),
  };
}
