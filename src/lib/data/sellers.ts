"use server";

import { createHash } from "node:crypto";
import type { PaginatedResponse, Product } from "@spree/sdk";
import { SpreeError } from "@spree/sdk";
import { PRODUCT_CARD_FIELDS } from "@/lib/data/cached";
import type { SellerStorefrontPayload } from "@/lib/data/seller-storefront-types";
import {
  getAccessToken,
  getAuthOptions,
  getClient,
  getLocaleOptions,
} from "@/lib/spree";

export async function listSellers(params?: {
  page?: number;
  limit?: number;
  sort?: string;
}) {
  const options = await getLocaleOptions();
  return getClient().sellers.list(params, options);
}

export async function getSeller(idOrSlug: string) {
  const options = await getLocaleOptions();
  return getClient().sellers.get(
    idOrSlug,
    { expand: ["policies", "rating_distribution"] },
    options,
  );
}

export async function getSellerStorefront(idOrSlug: string) {
  const [localeOptions, authOptions] = await Promise.all([
    getLocaleOptions(),
    getAuthOptions(),
  ]);
  return getClient().request<SellerStorefrontPayload>(
    "GET",
    `/sellers/${idOrSlug}/storefront`,
    {
      ...localeOptions,
      ...authOptions,
      params: { expand: "policies,rating_distribution" },
    },
  );
}

export async function getSellerProducts(
  sellerIdOrSlug: string,
  params: {
    /** Prefixed seller id (`sel_…`) — used when the nested shop products route is unavailable. */
    sellerId?: string;
    page?: number;
    limit?: number;
    section?: string;
    q?: Record<string, unknown>;
    sort?: string;
  } = {},
) {
  const options = await getLocaleOptions();
  const { sellerId, page = 1, limit = 24, section, q, sort } = params;

  const requestParams: Record<string, unknown> = {
    page,
    limit,
    sort,
    fields: PRODUCT_CARD_FIELDS.join(","),
    expand: "seller",
    ...(section ? { section } : {}),
  };
  if (q) {
    for (const [key, value] of Object.entries(q)) {
      if (value !== undefined) {
        requestParams[`q[${key}]`] = value;
      }
    }
  }

  try {
    return await getClient().request<PaginatedResponse<Product>>(
      "GET",
      `/sellers/${sellerIdOrSlug}/products`,
      {
        ...options,
        params: requestParams,
      },
    );
  } catch (error) {
    const catalogSellerId =
      sellerId ??
      (sellerIdOrSlug.startsWith("sel_") ? sellerIdOrSlug : undefined);
    if (
      section ||
      !catalogSellerId ||
      !(error instanceof SpreeError) ||
      error.status !== 404
    ) {
      throw error;
    }

    return getClient().products.list(
      {
        page,
        limit,
        sort,
        fields: PRODUCT_CARD_FIELDS,
        expand: ["seller"],
        q: { seller_id_eq: catalogSellerId, ...(q ?? {}) },
      },
      options,
    );
  }
}

export async function getSellerReviews(
  sellerIdOrSlug: string,
  page = 1,
  limit = 10,
  sort?: string,
) {
  const options = await getLocaleOptions();
  const namedSort =
    sort === "newest" || sort === "highest" || sort === "lowest"
      ? sort
      : undefined;
  return getClient().sellers.reviews.list(
    sellerIdOrSlug,
    { page, limit, ...(namedSort ? { sort: namedSort } : {}) },
    options,
  );
}

export async function getSellerFollowers(
  sellerIdOrSlug: string,
  page = 1,
  limit = 24,
) {
  const options = await getLocaleOptions();
  return getClient().sellers.followers.list(
    sellerIdOrSlug,
    { page, limit },
    options,
  );
}

export async function createCustomOrderRequest(
  sellerId: string,
  params: {
    description: string;
    wanted_by_on?: string;
    source_product_id?: string;
    attachments?: string[];
  },
) {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("SIGN_IN_REQUIRED");
  }
  return getClient().sellers.customOrderRequests.create(sellerId, params, {
    token,
  });
}

export async function uploadCustomOrderAttachment(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("missing_file");

  const token = await getAccessToken();
  if (!token) throw new Error("SIGN_IN_REQUIRED");

  const buffer = Buffer.from(await file.arrayBuffer());
  const upload = await getClient().customer.directUploads.create(
    {
      blob: {
        filename: file.name,
        byte_size: file.size,
        checksum: createHash("md5").update(buffer).digest("base64"),
        content_type: file.type || "application/octet-stream",
      },
    },
    { token },
  );
  const response = await fetch(upload.direct_upload.url, {
    method: "PUT",
    headers: upload.direct_upload.headers,
    body: buffer,
  });
  if (!response.ok) throw new Error(`upload_failed_${response.status}`);

  return { signedId: upload.signed_id, filename: file.name };
}

export async function getPrivateListing(productId: string) {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("SIGN_IN_REQUIRED");
  }
  return getClient().customer.privateListings.get(productId, { token });
}
