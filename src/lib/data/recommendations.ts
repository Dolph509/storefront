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
