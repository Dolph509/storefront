"use server";

import { createHash } from "node:crypto";
import { getAccessToken, getClient, getLocaleOptions } from "@/lib/spree";

export async function getSeller(idOrSlug: string) {
  const options = await getLocaleOptions();
  return getClient().sellers.get(idOrSlug, { expand: ["policies"] }, options);
}

export async function getSellerProducts(sellerId: string, page = 1) {
  const options = await getLocaleOptions();
  return getClient().products.list(
    { seller_id_eq: sellerId, page, limit: 24, expand: ["seller"] },
    options,
  );
}

export async function getSellerReviews(sellerId: string) {
  const options = await getLocaleOptions();
  return getClient().sellers.reviews.list(
    sellerId,
    { page: 1, limit: 5 },
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
