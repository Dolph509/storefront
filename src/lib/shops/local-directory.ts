import type { Product, Seller } from "@spree/sdk";
import { getSellerProducts } from "@/lib/data/sellers";
import { sellerHasBadgeKey } from "@/lib/seller-badges/presentation";

export function isStarSellerCandidate(seller: Seller): boolean {
  if (
    sellerHasBadgeKey(seller.badges, "star_seller") ||
    sellerHasBadgeKey(seller.badges, "top_shop")
  ) {
    return true;
  }
  return (
    (seller.average_rating ?? 0) >= 4.8 && (seller.reviews_count ?? 0) >= 8
  );
}

export function sortSellersByNewest(sellers: Seller[]): Seller[] {
  return [...sellers].sort((left, right) => {
    const leftTime = Date.parse(left.seller_since ?? "") || 0;
    const rightTime = Date.parse(right.seller_since ?? "") || 0;
    return rightTime - leftTime;
  });
}

export function shopCategoryLabel(seller: Seller): string | null {
  const tagline = seller.tagline?.trim();
  if (tagline) return tagline;
  if (seller.ships_from) return seller.ships_from;
  return null;
}

export function monthsOnMarketplace(
  sellerSince: string | null | undefined,
  now = Date.now(),
): number | null {
  if (!sellerSince) return null;
  const started = Date.parse(sellerSince);
  if (!Number.isFinite(started)) return null;
  const months = Math.max(
    0,
    Math.floor((now - started) / (1000 * 60 * 60 * 24 * 30)),
  );
  return months;
}

export async function loadShopPreviewProducts(
  seller: Seller,
  limit = 4,
): Promise<{ products: Product[]; count: number }> {
  try {
    const response = await getSellerProducts(seller.slug, {
      sellerId: seller.id,
      limit,
      projection: "shop-card",
    });
    const products = (response.data ?? []).filter(
      (product) => product.purchasable !== false,
    );
    return {
      products: products.slice(0, limit),
      count: response.meta?.count ?? products.length,
    };
  } catch {
    return { products: [], count: 0 };
  }
}
