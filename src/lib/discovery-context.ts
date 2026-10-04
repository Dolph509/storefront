import type { Product } from "@spree/sdk";

/** Buyer discovery attribution for seller storefront surfaces (Phase E). */

export const DISCOVERY_SOURCE_SELLER_SHOP = "seller_shop";

/** Buyer discovery attribution for marketplace search results. */

export const DISCOVERY_SOURCE_SEARCH = "search";

/** Buyer discovery attribution for homepage and marketplace recommendation rails. */
export const DISCOVERY_SOURCE_MARKETPLACE = "marketplace";

export const SEARCH_RESULTS_LIST_ID = "search-results";

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

  query_id?: string;
};

export function parseCartDiscoveryFromSearchParams(
  params: Record<string, string | string[] | undefined>,
): CartDiscoveryInput | undefined {
  const sellerShop = parseSellerShopDiscoveryFromSearchParams(params);

  if (sellerShop) return sellerShop;

  const search = parseSearchDiscoveryFromSearchParams(params);

  if (search) return search;

  return parseMarketplaceDiscoveryFromSearchParams(params);
}

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

export function parseSearchDiscoveryFromSearchParams(
  params: Record<string, string | string[] | undefined>,
): CartDiscoveryInput | undefined {
  const src = pickParam(params.src);

  if (src !== DISCOVERY_SOURCE_SEARCH) return undefined;

  const queryId = pickParam(params.query_id);

  if (!queryId) return undefined;

  const posRaw = pickParam(params.pos);

  const position = posRaw ? Number.parseInt(posRaw, 10) : undefined;

  return {
    source: DISCOVERY_SOURCE_SEARCH,

    query_id: queryId,

    list_id: pickParam(params.list_id) ?? SEARCH_RESULTS_LIST_ID,

    position: Number.isFinite(position) ? position : undefined,

    seller_id: pickParam(params.seller_id),

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

export function searchProductHref(
  basePath: string,

  productSlug: string,

  options: {
    queryId: string;

    position: number;

    sellerId?: string;

    listId?: string;
  },
): string {
  const query = new URLSearchParams({
    src: DISCOVERY_SOURCE_SEARCH,

    query_id: options.queryId,

    list_id: options.listId ?? SEARCH_RESULTS_LIST_ID,

    pos: String(options.position),
  });

  if (options.sellerId) query.set("seller_id", options.sellerId);

  return `${basePath}/products/${productSlug}?${query.toString()}`;
}

export function marketplaceProductHref(
  basePath: string,
  productSlug: string,
  options: {
    listId: string;
    position: number;
    sellerId?: string;
    section?: string;
  },
): string {
  const query = new URLSearchParams({
    src: DISCOVERY_SOURCE_MARKETPLACE,
    list_id: options.listId,
    pos: String(options.position),
  });
  if (options.sellerId) query.set("seller_id", options.sellerId);
  if (options.section) query.set("section", options.section);
  return `${basePath}/products/${productSlug}?${query.toString()}`;
}

export function marketplaceProductHrefForProduct(
  basePath: string,
  product: Pick<Product, "id" | "slug" | "seller"> & {
    seller_id?: string | null;
  },
  options: {
    listId: string;
    position: number;
    section?: string;
  },
): string {
  const sellerId = product.seller?.id ?? product.seller_id ?? undefined;
  return marketplaceProductHref(basePath, productDetailPathSegment(product), {
    listId: options.listId,
    position: options.position,
    sellerId,
    section: options.section,
  });
}

export function parseMarketplaceDiscoveryFromSearchParams(
  params: Record<string, string | string[] | undefined>,
): CartDiscoveryInput | undefined {
  const src = pickParam(params.src);
  if (src !== DISCOVERY_SOURCE_MARKETPLACE) return undefined;
  const listId = pickParam(params.list_id);
  if (!listId) return undefined;
  const posRaw = pickParam(params.pos);
  const position = posRaw ? Number.parseInt(posRaw, 10) : undefined;
  return {
    source: DISCOVERY_SOURCE_MARKETPLACE,
    list_id: listId,
    position: Number.isFinite(position) ? position : undefined,
    seller_id: pickParam(params.seller_id),
    section: pickParam(params.section),
  };
}

export function searchProductHrefForProduct(
  basePath: string,

  product: Pick<Product, "id" | "slug" | "seller"> & {
    seller_id?: string | null;
  },

  options: {
    queryId: string;

    position: number;

    listId?: string;
  },
): string {
  const sellerId = product.seller?.id ?? product.seller_id ?? undefined;

  return searchProductHref(basePath, productDetailPathSegment(product), {
    queryId: options.queryId,

    position: options.position,

    sellerId,

    listId: options.listId,
  });
}
