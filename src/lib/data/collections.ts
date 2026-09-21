"use server";

import type { Collection, ProductListParams } from "@spree/sdk";
import { cacheLife, cacheTag } from "next/cache";
import { PRODUCT_CARD_FIELDS } from "@/lib/data/cached";
import { getAccessToken, getClient, getLocaleOptions } from "@/lib/spree";

async function cachedGetCollection(
  idOrPermalink: string,
  options: { locale?: string; country?: string },
) {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag("collections", `collection:${idOrPermalink}`);
  return getClient().collections.get(idOrPermalink, undefined, options);
}

export async function getCollection(
  idOrPermalink: string,
): Promise<Collection> {
  const options = await getLocaleOptions();
  return cachedGetCollection(idOrPermalink, options);
}

async function cachedListCollectionProducts(
  idOrPermalink: string,
  params: ProductListParams | undefined,
  options: { locale?: string; country?: string },
) {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag("products", `collection-products:${idOrPermalink}`);
  return getClient().collections.products.list(
    idOrPermalink,
    {
      fields: PRODUCT_CARD_FIELDS,
      expand: ["seller"],
      ...params,
    },
    options,
  );
}

export async function getCollectionProducts(
  idOrPermalink: string,
  params?: ProductListParams,
) {
  const options = await getLocaleOptions();
  await getAccessToken();
  return cachedListCollectionProducts(idOrPermalink, params, options);
}
