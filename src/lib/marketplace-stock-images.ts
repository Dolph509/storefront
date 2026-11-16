const CATEGORY_FALLBACKS = [
  "/marketplace/category-personalized.png",
  "/marketplace/category-home.png",
  "/marketplace/category-jewelry.png",
  "/marketplace/category-knitwear.png",
  "/marketplace/category-art.png",
  "/marketplace/category-wedding.png",
] as const;

export interface MarketplaceEditorialCategory {
  id: string;
  name: string;
  href: string;
  imageUrl: string;
}

const EDITORIAL_CATEGORIES = [
  ["personalized", "Personalized Gifts", "personalized", 0],
  ["home", "Home & Living", "home", 1],
  ["jewelry", "Jewelry", "jewelry", 2],
  ["clothing", "Clothing", "clothing", 3],
  ["art", "Art & Wall Decor", "art", 4],
  ["wedding", "Wedding", "wedding", 5],
  ["baby", "Baby & Kids", "baby", 0],
  ["pets", "Pet Accessories", "pets", 1],
  ["seasonal", "Seasonal", "seasonal", 4],
  ["gifts", "Gift Cards", "gifts", 0],
] as const;

export function getEditorialCategories(
  basePath: string,
): MarketplaceEditorialCategory[] {
  return EDITORIAL_CATEGORIES.map(([id, name, query, imageIndex]) => ({
    id,
    name,
    href: `${basePath}/products?q=${encodeURIComponent(query)}`,
    imageUrl: CATEGORY_FALLBACKS[imageIndex],
  }));
}

export function resolveCatalogImageUrl(
  imageUrl: string | null | undefined,
  index: number,
): string {
  return (
    imageUrl?.trim() || CATEGORY_FALLBACKS[index % CATEGORY_FALLBACKS.length]
  );
}

export function getCollectionStockImage(index: number, hint?: string): string {
  const normalizedHint = hint?.toLowerCase() ?? "";
  if (normalizedHint.includes("wedding")) return CATEGORY_FALLBACKS[5];
  if (normalizedHint.includes("jewel")) return CATEGORY_FALLBACKS[2];
  if (normalizedHint.includes("home")) return CATEGORY_FALLBACKS[1];
  if (normalizedHint.includes("art")) return CATEGORY_FALLBACKS[4];
  if (normalizedHint.includes("cloth") || normalizedHint.includes("knit")) {
    return CATEGORY_FALLBACKS[3];
  }
  return CATEGORY_FALLBACKS[index % CATEGORY_FALLBACKS.length];
}

export function getMarketplaceHeroImageUrl(
  _variant: "desktop" | "mobile",
): string {
  return "/marketplace/artisan-home-hero-v2.png";
}

export function getOccasionCategories(
  basePath: string,
): MarketplaceEditorialCategory[] {
  const occasions: Array<[string, string, string, number]> = [
    ["birthday", "Birthday", "birthday", 0],
    ["wedding", "Wedding", "wedding", 5],
    ["anniversary", "Anniversary", "anniversary", 2],
    ["housewarming", "Housewarming", "housewarming", 1],
    ["holiday", "Holiday", "holiday", 4],
    ["just-because", "Just Because", "gift", 0],
  ];

  return occasions.map(([id, name, query, imageIndex]) => ({
    id,
    name,
    href: `${basePath}/products?q=${encodeURIComponent(query)}`,
    imageUrl: CATEGORY_FALLBACKS[imageIndex],
  }));
}

export function getEditorialStockImage(variant: "makers" | "gifts"): string {
  return variant === "makers"
    ? "/marketplace/maker-story.png"
    : "/marketplace/thoughtful-gift.png";
}
