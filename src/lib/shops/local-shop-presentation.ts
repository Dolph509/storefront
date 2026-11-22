import type { Seller } from "@spree/sdk";
import { getLocalShopStockMedia } from "@/lib/marketplace-stock-images";

export type LocalShopPresentation = {
  displayName: string;
  categoryLabel: string;
  heroImage: string;
  thumbImages: [string, string];
  averageRating: number;
  reviewsCount: number;
  avatarInitials: string;
  /** Display distance used when the seller has no geo match. */
  showcaseMiles: number;
  /** City used on seller cards when ships_from is missing. */
  locationCity: string;
};

const CATEGORY_LABEL_TO_ID: Record<string, string> = {
  "Home & Living": "home",
  Jewelry: "jewelry",
  Clothing: "clothing",
  Gifts: "gifts",
  Art: "art",
  Beauty: "beauty",
};

export function getLocalShopCategoryId(categoryLabel: string): string | null {
  return CATEGORY_LABEL_TO_ID[categoryLabel] ?? null;
}

const CURATED: LocalShopPresentation[] = [
  {
    displayName: "Clay & Kind Studio",
    categoryLabel: "Home & Living",
    heroImage: "/marketplace/category-home.png",
    thumbImages: [
      "/marketplace/artisan-home-hero-v2.png",
      "/marketplace/thoughtful-gift.png",
    ],
    averageRating: 4.9,
    reviewsCount: 128,
    avatarInitials: "CK",
    showcaseMiles: 1.2,
    locationCity: "Wilmington",
  },
  {
    displayName: "Rivermade Jewelry",
    categoryLabel: "Jewelry",
    heroImage: "/marketplace/category-jewelry.png",
    thumbImages: [
      "/marketplace/category-personalized.png",
      "/marketplace/category-wedding.png",
    ],
    averageRating: 4.8,
    reviewsCount: 96,
    avatarInitials: "RJ",
    showcaseMiles: 3.8,
    locationCity: "Newark",
  },
  {
    displayName: "Lone Thread Textiles",
    categoryLabel: "Clothing",
    heroImage: "/marketplace/category-knitwear.png",
    thumbImages: [
      "/marketplace/maker-story.png",
      "/marketplace/category-art.png",
    ],
    averageRating: 4.9,
    reviewsCount: 74,
    avatarInitials: "LT",
    showcaseMiles: 5.4,
    locationCity: "West Chester",
  },
  {
    displayName: "Oak Hollow Woodwork",
    categoryLabel: "Home & Living",
    heroImage: "/marketplace/artisan-home-hero-v2.png",
    thumbImages: [
      "/marketplace/category-home.png",
      "/marketplace/thoughtful-gift.png",
    ],
    averageRating: 4.9,
    reviewsCount: 112,
    avatarInitials: "OH",
    showcaseMiles: 2.1,
    locationCity: "Hockessin",
  },
  {
    displayName: "Bloom & Bind",
    categoryLabel: "Gifts",
    heroImage: "/marketplace/category-personalized.png",
    thumbImages: [
      "/marketplace/category-wedding.png",
      "/marketplace/maker-story.png",
    ],
    averageRating: 5.0,
    reviewsCount: 61,
    avatarInitials: "BB",
    showcaseMiles: 4.2,
    locationCity: "Media",
  },
  {
    displayName: "Northlight Prints",
    categoryLabel: "Art",
    heroImage: "/marketplace/category-art.png",
    thumbImages: [
      "/marketplace/artisan-heart-hero.png",
      "/marketplace/category-home.png",
    ],
    averageRating: 4.7,
    reviewsCount: 88,
    avatarInitials: "NP",
    showcaseMiles: 6.5,
    locationCity: "Kennett Square",
  },
  {
    displayName: "Harbor Soap Co.",
    categoryLabel: "Beauty",
    heroImage: "/marketplace/thoughtful-gift.png",
    thumbImages: [
      "/marketplace/category-personalized.png",
      "/marketplace/category-jewelry.png",
    ],
    averageRating: 4.8,
    reviewsCount: 143,
    avatarInitials: "HS",
    showcaseMiles: 3.1,
    locationCity: "Greenville",
  },
  {
    displayName: "Fieldstone Ceramics",
    categoryLabel: "Home & Living",
    heroImage: "/marketplace/maker-story.png",
    thumbImages: [
      "/marketplace/category-home.png",
      "/marketplace/artisan-home-hero-v2.png",
    ],
    averageRating: 4.9,
    reviewsCount: 57,
    avatarInitials: "FC",
    showcaseMiles: 7.8,
    locationCity: "Chadds Ford",
  },
  {
    displayName: "Willow Lane Studio",
    categoryLabel: "Art",
    heroImage: "/marketplace/artisan-heart-hero.png",
    thumbImages: [
      "/marketplace/category-art.png",
      "/marketplace/category-knitwear.png",
    ],
    averageRating: 4.6,
    reviewsCount: 39,
    avatarInitials: "WL",
    showcaseMiles: 8.4,
    locationCity: "Malvern",
  },
  {
    displayName: "Copper Finch Metals",
    categoryLabel: "Jewelry",
    heroImage: "/marketplace/category-wedding.png",
    thumbImages: [
      "/marketplace/category-jewelry.png",
      "/marketplace/thoughtful-gift.png",
    ],
    averageRating: 4.8,
    reviewsCount: 81,
    avatarInitials: "CF",
    showcaseMiles: 9.2,
    locationCity: "Exton",
  },
  {
    displayName: "Soft Grain Goods",
    categoryLabel: "Clothing",
    heroImage: "/marketplace/category-knitwear.png",
    thumbImages: [
      "/marketplace/maker-story.png",
      "/marketplace/category-personalized.png",
    ],
    averageRating: 4.7,
    reviewsCount: 52,
    avatarInitials: "SG",
    showcaseMiles: 11.0,
    locationCity: "Downingtown",
  },
];

function seedIndex(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash % CURATED.length;
}

function isFixtureName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return (
    normalized.startsWith("[dev-dataset]") ||
    normalized.startsWith("dev seller") ||
    normalized.startsWith("badge ") ||
    normalized.includes("merch seller") ||
    normalized.includes("e2e ")
  );
}

/**
 * Presentation overlay for the local shops page.
 * Seed/fixture catalogs rarely have lifestyle media or polished names, so this
 * page uses curated showcase copy + photos while keeping real seller deep links.
 */
export function presentLocalShop(
  seller: Seller,
  index = 0,
): LocalShopPresentation {
  const curated = CURATED[index % CURATED.length] ?? CURATED[0];
  const stock = getLocalShopStockMedia(seller.id);
  const hasRealMedia = Boolean(
    seller.cover_photo_url || seller.square_logo_url || seller.logo_url,
  );
  const useCuratedIdentity = isFixtureName(seller.name) || !hasRealMedia;

  return {
    displayName: useCuratedIdentity ? curated.displayName : seller.name,
    categoryLabel: curated.categoryLabel || stock.categoryLabel,
    heroImage: hasRealMedia
      ? seller.cover_photo_url ||
        seller.square_logo_url ||
        seller.logo_url ||
        curated.heroImage
      : curated.heroImage,
    thumbImages: curated.thumbImages,
    averageRating:
      !useCuratedIdentity &&
      seller.average_rating != null &&
      (seller.reviews_count ?? 0) > 0
        ? seller.average_rating
        : curated.averageRating,
    reviewsCount:
      !useCuratedIdentity && (seller.reviews_count ?? 0) > 0
        ? seller.reviews_count!
        : curated.reviewsCount,
    avatarInitials: curated.avatarInitials,
    showcaseMiles: curated.showcaseMiles,
    locationCity: curated.locationCity,
  };
}

export function presentLocalShopById(seller: Seller): LocalShopPresentation {
  return presentLocalShop(seller, seedIndex(seller.id));
}
