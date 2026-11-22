import type { Seller } from "@spree/sdk";
import {
  getLocalShopCategoryId,
  type LocalShopPresentation,
  presentLocalShop,
  presentLocalShopById,
} from "@/lib/shops/local-shop-presentation";
import {
  buildCityStateLabel,
  formatCityStateLabel,
} from "@/lib/shops/location-label";
import type { VisitorLocation } from "@/lib/shops/visitor-location-shared";
import { sellerMatchesVisitorLocation } from "@/lib/shops/visitor-location-shared";

export const LOCAL_RADIUS_OPTIONS = [5, 10, 25, 50, 100] as const;
export type LocalRadiusMiles = (typeof LOCAL_RADIUS_OPTIONS)[number];

export const LOCAL_CATEGORY_PILLS = [
  { id: "all", labelKey: "categoryAll", icon: "store" },
  { id: "jewelry", labelKey: "categoryJewelry", icon: "gem" },
  { id: "home", labelKey: "categoryHome", icon: "home" },
  { id: "art", labelKey: "categoryArt", icon: "palette" },
  { id: "gifts", labelKey: "categoryGifts", icon: "gift" },
  { id: "clothing", labelKey: "categoryClothing", icon: "shirt" },
  { id: "beauty", labelKey: "categoryBeauty", icon: "sparkles" },
] as const;

export type LocalCategoryId = (typeof LOCAL_CATEGORY_PILLS)[number]["id"];

export const LOCAL_SORT_OPTIONS = ["nearest", "rating", "name"] as const;
export type LocalSortId = (typeof LOCAL_SORT_OPTIONS)[number];

const CATEGORY_KEYWORDS: Record<Exclude<LocalCategoryId, "all">, string[]> = {
  jewelry: ["jewel", "ring", "necklace", "bracelet", "earring"],
  home: ["home", "decor", "living", "wood", "ceramic", "pottery", "kitchen"],
  art: ["art", "print", "paint", "illustration", "gallery"],
  gifts: ["gift", "handmade", "custom", "personal"],
  clothing: ["cloth", "apparel", "wear", "textile", "fabric"],
  beauty: ["beauty", "skin", "soap", "candle", "bath"],
};

export function parseLocalRadius(
  value: string | null | undefined,
): LocalRadiusMiles {
  const parsed = Number.parseInt(value ?? "25", 10);
  return (LOCAL_RADIUS_OPTIONS as readonly number[]).includes(parsed)
    ? (parsed as LocalRadiusMiles)
    : 25;
}

export function parseLocalCategory(
  value: string | null | undefined,
): LocalCategoryId {
  const match = LOCAL_CATEGORY_PILLS.find((pill) => pill.id === value);
  return match?.id ?? "all";
}

export function parseLocalSort(value: string | null | undefined): LocalSortId {
  const match = LOCAL_SORT_OPTIONS.find((option) => option === value);
  return match ?? "nearest";
}

/** Stable display distance for a shop in the visitor's area. */
export function estimateLocalDistanceMiles(sellerId: string): number {
  let hash = 0;
  for (let index = 0; index < sellerId.length; index += 1) {
    hash = (hash * 31 + sellerId.charCodeAt(index)) >>> 0;
  }
  const miles = 0.8 + (hash % 240) / 10;
  return Math.round(miles * 10) / 10;
}

export function sellerMatchesCategory(
  seller: Seller,
  category: LocalCategoryId,
  presentationIndex?: number,
): boolean {
  if (category === "all") return true;

  const presentation =
    presentationIndex == null
      ? presentLocalShopById(seller)
      : presentLocalShop(seller, presentationIndex);
  if (getLocalShopCategoryId(presentation.categoryLabel) === category) {
    return true;
  }

  const haystack =
    `${seller.name} ${seller.tagline ?? ""} ${presentation.displayName}`.toLowerCase();
  return CATEGORY_KEYWORDS[category].some((keyword) =>
    haystack.includes(keyword),
  );
}

export type LocalShopRecord = {
  seller: Seller;
  distanceMiles: number;
  isLocalMatch: boolean;
  presentationIndex: number;
  /** City, state shown on seller cards. */
  locationLabel: string;
};

function isFixtureSellerName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return (
    normalized.startsWith("[dev-dataset]") ||
    normalized.startsWith("dev seller") ||
    normalized.startsWith("badge ") ||
    normalized.includes("merch seller") ||
    normalized.includes("e2e ")
  );
}

/** City, state for seller cards — real ships_from when distinct, else nearby town. */
export function resolveSellerLocationLabel(
  seller: Seller,
  presentation: LocalShopPresentation,
  visitor: VisitorLocation,
): string {
  const visitorLabel =
    formatCityStateLabel(visitor.label) ||
    buildCityStateLabel(visitor.city, visitor.region);
  const region = visitor.region || visitorLabel?.split(",")[1]?.trim() || null;

  // Always pair the showcase town with the buyer's state so cards read as
  // local City, ST instead of miles.
  const showcase = buildCityStateLabel(presentation.locationCity, region);
  if (showcase) return showcase;

  const shipsFrom = formatCityStateLabel(seller.ships_from);
  if (
    shipsFrom?.includes(",") &&
    !isFixtureSellerName(seller.name) &&
    shipsFrom.toLowerCase() !== visitorLabel?.toLowerCase()
  ) {
    return shipsFrom;
  }

  return visitorLabel || presentation.locationCity || "Local";
}

export function buildLocalShopRecords(
  sellers: Seller[],
  location: VisitorLocation,
  radiusMiles: LocalRadiusMiles,
  category: LocalCategoryId,
  sort: LocalSortId = "nearest",
): LocalShopRecord[] {
  // Stable order so category pills get an even spread of showcase shops.
  const ordered = [...sellers].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
  const records = ordered.map((seller, index) => {
    const isLocalMatch = sellerMatchesVisitorLocation(seller, location);
    const presentation = presentLocalShop(seller, index);
    const distanceMiles = isLocalMatch
      ? estimateLocalDistanceMiles(seller.id)
      : presentation.showcaseMiles;
    return {
      seller,
      distanceMiles,
      isLocalMatch,
      presentationIndex: index,
      locationLabel: resolveSellerLocationLabel(seller, presentation, location),
    };
  });

  const filtered = records
    .filter((record) =>
      sellerMatchesCategory(record.seller, category, record.presentationIndex),
    )
    .filter((record) => record.distanceMiles <= radiusMiles);

  return filtered.sort((left, right) => {
    // Keep true local matches ahead of broader showcase rows.
    if (left.isLocalMatch !== right.isLocalMatch) {
      return left.isLocalMatch ? -1 : 1;
    }
    const leftPresentation = presentLocalShop(
      left.seller,
      left.presentationIndex,
    );
    const rightPresentation = presentLocalShop(
      right.seller,
      right.presentationIndex,
    );
    if (sort === "rating") {
      if (leftPresentation.averageRating !== rightPresentation.averageRating) {
        return rightPresentation.averageRating - leftPresentation.averageRating;
      }
      return left.distanceMiles - right.distanceMiles;
    }
    if (sort === "name") {
      const byName = leftPresentation.displayName.localeCompare(
        rightPresentation.displayName,
      );
      if (byName !== 0) return byName;
      return left.distanceMiles - right.distanceMiles;
    }
    if (left.distanceMiles !== right.distanceMiles) {
      return left.distanceMiles - right.distanceMiles;
    }
    return rightPresentation.averageRating - leftPresentation.averageRating;
  });
}

export function formatDistanceMiles(
  miles: number | null,
  locale: string,
): string | null {
  if (miles == null) return null;
  const value = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: miles < 10 ? 1 : 0,
  }).format(miles);
  return `${value} miles`;
}

export function shortCityLabel(locationLabel: string): string {
  return locationLabel.split(",")[0]?.trim() || locationLabel;
}
