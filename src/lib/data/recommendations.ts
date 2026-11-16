"use server";

import type {
  Product,
  RecommendationListParams,
  RecommendationListResponse,
} from "@spree/sdk";
import { cacheLife, cacheTag } from "next/cache";
import { PRODUCT_CARD_FIELDS } from "@/lib/data/cached";
import { getCustomer } from "@/lib/data/customer";
import { listFavorites } from "@/lib/data/favorites";
import { HOME_RAIL_MIN_PRODUCTS } from "@/lib/data/recommendations-constants";
import {
  DEFAULT_SURFACE,
  getAccessToken,
  getClientForSurface,
  getLocaleOptions,
  type Surface,
} from "@/lib/spree";
import { marketplaceFor } from "@/lib/spree/marketplace";

const DEFAULT_LIMIT = 8;

const EMPTY_RECOMMENDATION_LIST: RecommendationListResponse = {
  data: [],
  meta: { count: 0 },
};

async function listWithCardFields(
  fetcher: () => Promise<{ data: Product[] }>,
): Promise<Product[]> {
  try {
    const response = await fetcher();
    return response.data ?? [];
  } catch {
    return [];
  }
}

export async function getSimilarProducts(
  productId: string,
  surface: Surface = DEFAULT_SURFACE,
  limit = DEFAULT_LIMIT,
): Promise<Product[]> {
  const options = await getLocaleOptions();
  const token = await getAccessToken();
  const params: RecommendationListParams = {
    limit,
    fields: PRODUCT_CARD_FIELDS,
    expand: ["seller"],
  };
  return listWithCardFields(() =>
    getClientForSurface(surface).products.recommendations.similar(
      productId,
      params,
      { ...options, ...(token ? { token } : {}) },
    ),
  );
}

export async function getMoreFromShopProducts(
  productId: string,
  surface: Surface = DEFAULT_SURFACE,
  limit = DEFAULT_LIMIT,
): Promise<Product[]> {
  const options = await getLocaleOptions();
  const token = await getAccessToken();
  const params: RecommendationListParams = {
    limit,
    fields: PRODUCT_CARD_FIELDS,
    expand: ["seller"],
  };
  return listWithCardFields(() =>
    getClientForSurface(surface).products.recommendations.shop(
      productId,
      params,
      { ...options, ...(token ? { token } : {}) },
    ),
  );
}

export async function cachedTrendingProducts(
  options: { locale?: string; country?: string },
  surface: Surface,
  userToken?: string,
  limit = DEFAULT_LIMIT,
) {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag(`recommendations-trending-${surface}`);
  const params: RecommendationListParams = {
    limit,
    fields: PRODUCT_CARD_FIELDS,
    expand: ["seller"],
  };
  try {
    return await marketplaceFor(
      getClientForSurface(surface),
    ).recommendations.trending(params, {
      ...options,
      ...(surface === "wholesale" && userToken ? { token: userToken } : {}),
    });
  } catch {
    return EMPTY_RECOMMENDATION_LIST;
  }
}

export async function getTrendingProducts(
  surface: Surface = DEFAULT_SURFACE,
  limit = DEFAULT_LIMIT,
): Promise<Product[]> {
  const options = await getLocaleOptions();
  const token = await getAccessToken();
  const response = await cachedTrendingProducts(options, surface, token, limit);
  return response.data ?? [];
}

export async function cachedNewArrivalProducts(
  options: { locale?: string; country?: string },
  surface: Surface,
  userToken?: string,
  limit = DEFAULT_LIMIT,
) {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag(`recommendations-new-${surface}`);
  const params: RecommendationListParams = {
    limit,
    fields: PRODUCT_CARD_FIELDS,
    expand: ["seller"],
  };
  try {
    return await marketplaceFor(
      getClientForSurface(surface),
    ).recommendations.new(params, {
      ...options,
      ...(surface === "wholesale" && userToken ? { token: userToken } : {}),
    });
  } catch {
    return EMPTY_RECOMMENDATION_LIST;
  }
}

export async function getNewArrivalProducts(
  surface: Surface = DEFAULT_SURFACE,
  limit = DEFAULT_LIMIT,
): Promise<Product[]> {
  const options = await getLocaleOptions();
  const token = await getAccessToken();
  const response = await cachedNewArrivalProducts(
    options,
    surface,
    token,
    limit,
  );
  return response.data ?? [];
}

export async function getFollowedShopProducts(
  surface: Surface = DEFAULT_SURFACE,
): Promise<Product[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const options = await getLocaleOptions();
  const params: RecommendationListParams = {
    limit: DEFAULT_LIMIT,
    fields: PRODUCT_CARD_FIELDS,
    expand: ["seller"],
  };
  return listWithCardFields(() =>
    marketplaceFor(getClientForSurface(surface)).recommendations.followedShops(
      params,
      { ...options, token },
    ),
  );
}

function meetsHomeRailMinimum(products: Product[]) {
  return products.length >= HOME_RAIL_MIN_PRODUCTS ? products : [];
}

async function personalizationAllowed() {
  const token = await getAccessToken();
  if (!token) return null;

  const customer = await getCustomer();
  if (customer?.personalization_enabled === false) return null;

  return token;
}

export async function getRecommendedForYouProducts(
  surface: Surface = DEFAULT_SURFACE,
  limit = DEFAULT_LIMIT,
): Promise<Product[]> {
  const token = await personalizationAllowed();
  if (!token) return [];

  const options = await getLocaleOptions();
  const params: RecommendationListParams = {
    limit,
    fields: PRODUCT_CARD_FIELDS,
    expand: ["seller"],
  };
  const products = await listWithCardFields(() =>
    marketplaceFor(getClientForSurface(surface)).recommendations.forYou(
      params,
      { ...options, token },
    ),
  );
  return meetsHomeRailMinimum(products);
}

export type DiscoveryRecommendationContext = {
  surface: "category" | "collection" | "cart" | "favorites" | "account";
  categoryId?: string;
};

/** Personalized recommendations with contextual (trending) fallback when opted out. */
export async function getPersonalizedDiscoveryProducts(
  context: DiscoveryRecommendationContext,
  limit = DEFAULT_LIMIT,
): Promise<{ products: Product[]; personalized: boolean }> {
  const token = await personalizationAllowed();
  if (token) {
    const personalized = await getRecommendedForYouProducts(undefined, limit);
    const filtered = context.categoryId
      ? personalized.filter((product) =>
          product.categories?.some(
            (category) => category.id === context.categoryId,
          ),
        )
      : personalized;
    if (filtered.length >= HOME_RAIL_MIN_PRODUCTS) {
      return { products: filtered.slice(0, limit), personalized: true };
    }
    if (!context.categoryId && personalized.length >= HOME_RAIL_MIN_PRODUCTS) {
      return { products: personalized, personalized: true };
    }
  }

  const trending = await getTrendingProducts(undefined, limit);
  return { products: trending, personalized: false };
}

export async function getCartComplementProducts(
  limit = DEFAULT_LIMIT,
): Promise<{ products: Product[]; personalized: boolean }> {
  const token = await personalizationAllowed();
  if (!token) {
    return {
      products: await getTrendingProducts(undefined, limit),
      personalized: false,
    };
  }
  const products = await getRecommendedForYouProducts(undefined, limit);
  if (products.length) return { products, personalized: true };
  return {
    products: await getTrendingProducts(undefined, limit),
    personalized: false,
  };
}

export async function getSellerShopDiscoveryProducts(
  sellerId: string,
  sellerSlug: string,
  excludeProductIds: string[] = [],
  limit = DEFAULT_LIMIT,
): Promise<{ products: Product[]; personalized: boolean }> {
  const exclude = new Set(excludeProductIds);
  const token = await personalizationAllowed();

  if (token) {
    const personalized = await getRecommendedForYouProducts(
      undefined,
      limit + 16,
    );
    const scoped = personalized.filter(
      (product) =>
        !exclude.has(product.id) &&
        product.purchasable &&
        (product.seller_id === sellerId || product.seller?.id === sellerId),
    );
    if (scoped.length >= HOME_RAIL_MIN_PRODUCTS) {
      return { products: scoped.slice(0, limit), personalized: true };
    }
  }

  const { getSellerProducts } = await import("@/lib/data/sellers");
  const catalog = await getSellerProducts(sellerSlug, {
    sellerId,
    page: 1,
    limit: limit + exclude.size,
    sort: "newest",
  });
  const fallback = (catalog.data ?? []).filter(
    (product) => !exclude.has(product.id) && product.purchasable,
  );
  const products = meetsHomeRailMinimum(fallback.slice(0, limit));
  return { products, personalized: false };
}

/** Cross-category complements from the similar pool (same API, different presentation). */
export async function getCompleteTheLookProducts(
  product: Product,
  limit = DEFAULT_LIMIT,
): Promise<Product[]> {
  const primaryCategoryId = product.categories?.[0]?.id;
  const similar = await getSimilarProducts(
    product.id,
    undefined,
    Math.max(limit * 3, 24),
  );
  const crossCategory = similar.filter((candidate) => {
    if (candidate.id === product.id) return false;
    if (!primaryCategoryId) return true;
    return !candidate.categories?.some(
      (category) => category.id === primaryCategoryId,
    );
  });
  if (crossCategory.length) return crossCategory.slice(0, limit);
  return similar
    .filter((candidate) => candidate.id !== product.id)
    .slice(0, limit);
}

export async function getProductPageRecommendedProducts(
  productId: string,
  limit = DEFAULT_LIMIT,
): Promise<{ products: Product[]; personalized: boolean }> {
  const token = await personalizationAllowed();
  if (token) {
    const personalized = await getRecommendedForYouProducts(
      undefined,
      limit + 8,
    );
    const filtered = personalized.filter((product) => product.id !== productId);
    if (filtered.length) {
      return { products: filtered.slice(0, limit), personalized: true };
    }
  }

  const similar = await getSimilarProducts(productId, undefined, limit + 4);
  const contextual = similar.filter((product) => product.id !== productId);
  if (contextual.length) {
    return { products: contextual.slice(0, limit), personalized: false };
  }

  const trending = await getTrendingProducts(undefined, limit + 4);
  return {
    products: trending
      .filter((product) => product.id !== productId)
      .slice(0, limit),
    personalized: false,
  };
}

export async function getSimilarToSavedProducts(
  surface: Surface = DEFAULT_SURFACE,
  limit = DEFAULT_LIMIT,
): Promise<Product[]> {
  const token = await personalizationAllowed();
  if (!token) return [];

  const favorites = await listFavorites();
  if (favorites.success && favorites.data.length > 0) {
    const favoriteProductIds = new Set(
      favorites.data
        .map((item) => item.product_id)
        .filter((productId): productId is string => Boolean(productId)),
    );
    const seedProductId = favorites.data.find(
      (item) => item.product_id,
    )?.product_id;
    if (seedProductId) {
      const similar = await getSimilarProducts(
        seedProductId,
        surface,
        limit + favoriteProductIds.size,
      );
      const deduped = similar.filter(
        (product) => !favoriteProductIds.has(product.id),
      );
      const fromFavorites = meetsHomeRailMinimum(deduped.slice(0, limit));
      if (fromFavorites.length > 0) return fromFavorites;
    }
  }

  const options = await getLocaleOptions();
  const params: RecommendationListParams = {
    limit,
    fields: PRODUCT_CARD_FIELDS,
    expand: ["seller"],
  };
  const products = await listWithCardFields(() =>
    marketplaceFor(getClientForSurface(surface)).recommendations.forYou(
      params,
      { ...options, token },
    ),
  );
  return meetsHomeRailMinimum(products);
}
