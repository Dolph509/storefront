import type { Product } from "@spree/sdk";

/** Buyer discovery attribution for seller storefront surfaces (Phase E). */
export const DISCOVERY_SOURCE_SELLER_SHOP = "seller_shop";

/** Storefront product URL segment — slug when present, else prefixed id. */
export function productDetailPathSegment(
  product: Pick<Product, "id" | "slug">,
): string {
  const slug = product.slug?.trim();
  if (slug) return slug;
  return product.id;
}

export type SellerShopListId =
  | "seller-shop-featured"
  | "seller-shop-best-sellers"
  | "seller-shop-new"
  | "seller-shop-sale"
  | "seller-shop-personalized"
  | "seller-shop-section"
  | "seller-shop-search"
  | "seller-shop-products"
  | "seller-shop-reviews-preview"
  | `seller-shop-section-${string}`;

export function sellerShopSectionListId(sectionSlug: string): SellerShopListId {
  return `seller-shop-section-${sectionSlug}`;
}

export type CartDiscoveryInput = {
  source: string;
  list_id?: string;
  position?: number;
  seller_id?: string;
  section?: string;
};

export function parseSellerShopDiscoveryFromSearchParams(
  params: Record<string, string | string[] | undefined>,
): CartDiscoveryInput | undefined {
  const src = pickParam(params.src);
  if (src !== DISCOVERY_SOURCE_SELLER_SHOP) return undefined;
  const sellerId = pickParam(params.seller_id);
  if (!sellerId) return undefined;
  const listId = pickParam(params.list_id);
  const posRaw = pickParam(params.pos);
  const position = posRaw ? Number.parseInt(posRaw, 10) : undefined;
  return {
    source: DISCOVERY_SOURCE_SELLER_SHOP,
    list_id: listId,
    position: Number.isFinite(position) ? position : undefined,
    seller_id: sellerId,
    section: pickParam(params.section),
  };
}

function pickParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function sellerShopProductHref(
  basePath: string,
  productSlug: string,
  options: {
    sellerId: string;
    listId: SellerShopListId;
    position: number;
    section?: string;
  },
): string {
  const query = new URLSearchParams({
    src: DISCOVERY_SOURCE_SELLER_SHOP,
    list_id: options.listId,
    pos: String(options.position),
    seller_id: options.sellerId,
  });
  if (options.section) query.set("section", options.section);
  return `${basePath}/products/${productSlug}?${query.toString()}`;
}

export function sellerShopProductHrefForProduct(
  basePath: string,
  product: Pick<Product, "id" | "slug">,
  options: {
    sellerId: string;
    listId: SellerShopListId;
    position: number;
    section?: string;
  },
): string {
  return sellerShopProductHref(
    basePath,
    productDetailPathSegment(product),
    options,
  );
}
