import type { Product } from "@spree/sdk";
import type { SellerStorefrontTab } from "@/lib/data/seller-storefront-types";

/** Seller shop content width — aligned with storefront `container` (~1280px). */
export const sellerShopShellClass =
  "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

export function orderProductsByIds(
  products: Product[],
  ids: string[],
): Product[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as Product[];
}

export function sellerShopPath(
  basePath: string,
  slug: string,
  tab: SellerStorefrontTab,
  query?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams({ tab });
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value) params.set(key, value);
    }
  }
  return `${basePath}/sellers/${slug}?${params.toString()}`;
}

export function buildSellerShopProductQuery(options: {
  textQuery?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  personalizable?: string;
  onSale?: string;
}): Record<string, unknown> | undefined {
  const q: Record<string, unknown> = {};
  if (options.textQuery) q.name_cont = options.textQuery;
  if (options.minPrice) q.price_gte = options.minPrice;
  if (options.maxPrice) q.price_lte = options.maxPrice;
  if (options.minRating) q.average_rating_gte = options.minRating;
  if (options.personalizable === "1") q.personalizable = true;
  if (options.onSale === "1") q.on_sale = true;
  return Object.keys(q).length ? q : undefined;
}

export function parseSellerStorefrontTab(
  value: string | undefined,
): SellerStorefrontTab {
  switch (value) {
    case "home":
    case "products":
    case "reviews":
    case "about":
    case "policies":
    case "custom-orders":
      return value;
    default:
      return "home";
  }
}
