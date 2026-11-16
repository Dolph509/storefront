"use server";

import type {
  Category,
  CategoryListParams,
  ProductListParams,
} from "@spree/sdk";
import { cacheLife, cacheTag } from "next/cache";
import { buildCategoryNavigationTree } from "@/lib/data/category-navigation-tree";
import { getAccessToken, getClient, getLocaleOptions } from "@/lib/spree";

async function cachedListCategories(
  params: CategoryListParams | undefined,
  options: { locale?: string; country?: string },
) {
  "use cache: remote";
  cacheLife("hours");
  cacheTag("categories");
  return getClient().categories.list(params, options);
}

export async function getCategories(
  params?: CategoryListParams,
  options?: { locale?: string; country?: string },
) {
  const localeOptions = options ?? (await getLocaleOptions());
  return cachedListCategories(params, localeOptions);
}

export async function getCategoryNavigationTree(options: {
  locale?: string;
  country?: string;
}): Promise<Category[]> {
  const firstPage = await getCategories(
    { page: 1, limit: 100, sort: "position" },
    options,
  );
  const remainingPages = await Promise.all(
    Array.from(
      { length: Math.max(0, (firstPage.meta?.pages ?? 1) - 1) },
      (_, i) =>
        getCategories({ page: i + 2, limit: 100, sort: "position" }, options),
    ),
  );
  const categories = [firstPage, ...remainingPages].flatMap(
    (page) => page.data ?? [],
  );
  return buildCategoryNavigationTree(categories);
}

export async function cachedGetCategory(
  idOrPermalink: string,
  params: { expand?: string[] } | undefined,
  options: { locale?: string; country?: string },
) {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag("category");
  return getClient().categories.get(idOrPermalink, params, options);
}

export async function getCategory(
  idOrPermalink: string,
  params?: { expand?: string[] },
) {
  const options = await getLocaleOptions();
  return cachedGetCategory(idOrPermalink, params, options);
}

/**
 * Persistent cached category products fetch. Cache key is derived from
 * all function arguments (categoryId, params, locale, country, userToken).
 * Guest users pass undefined so the cache entry is shared.
 */
async function cachedListCategoryProducts(
  categoryId: string,
  params: ProductListParams | undefined,
  options: { locale?: string; country?: string },
  _userToken?: string,
) {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag("products", `category-products:${categoryId}`);
  return getClient().products.list(
    { ...params, in_category: categoryId },
    options,
  );
}

export async function getCategoryProducts(
  categoryId: string,
  params?: ProductListParams,
) {
  const options = await getLocaleOptions();
  const userToken = await getAccessToken();
  if (userToken) {
    return getClient().products.list(
      { ...params, in_category: categoryId },
      {
        ...options,
        token: userToken,
        cache: "no-store",
      },
    );
  }
  return cachedListCategoryProducts(categoryId, params, options, userToken);
}
