import type { Seller } from "@spree/sdk";

export type VisitorLocationSource =
  | "profile"
  | "network"
  | "storefront"
  | "manual";

export interface VisitorLocation {
  label: string;
  city: string | null;
  region: string | null;
  countryCode: string | null;
  countryName: string | null;
  source: VisitorLocationSource;
  queryTokens: string[];
}

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function sellerMatchesVisitorLocation(
  seller: Seller,
  location: VisitorLocation,
): boolean {
  const shipsFrom = clean(seller.ships_from)?.toLowerCase();
  if (!shipsFrom) return false;
  return location.queryTokens.some((token) => shipsFrom.includes(token));
}

export function filterSellersByVisitorLocation(
  sellers: Seller[],
  location: VisitorLocation,
): { local: Seller[]; fallback: Seller[]; usedFallback: boolean } {
  const local = sellers.filter((seller) =>
    sellerMatchesVisitorLocation(seller, location),
  );
  if (local.length > 0) {
    return { local, fallback: sellers, usedFallback: false };
  }
  return { local: sellers, fallback: sellers, usedFallback: true };
}

export function productMatchesVisitorLocation(
  shipsFrom: string | null | undefined,
  location: VisitorLocation,
): boolean {
  const value = clean(shipsFrom)?.toLowerCase();
  if (!value) return false;
  return location.queryTokens.some((token) => value.includes(token));
}
