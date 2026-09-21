"use server";

import { createHash } from "node:crypto";
import type {
  CreateProductReviewParams,
  ListParams,
  UpdateProductReviewParams,
} from "@spree/sdk";
import { getClient, withAuthRefresh } from "@/lib/spree";
import { withFallback } from "./utils";

const emptyPage = {
  data: [] as const,
  meta: {
    page: 1,
    limit: 25,
    count: 0,
    pages: 0,
    from: 0,
    to: 0,
    in: 0,
    previous: null,
    next: null,
  },
};

export async function getProductReviews(
  productIdOrSlug: string,
  params?: ListParams & { sort?: "newest" | "highest" | "lowest" },
) {
  return withFallback(
    async () => getClient().products.reviews.list(productIdOrSlug, params),
    emptyPage,
  );
}

export async function getMyProductReviews(params?: ListParams) {
  return withFallback(
    async () =>
      withAuthRefresh(async (options) =>
        getClient().customer.productReviews.list(params, options),
      ),
    emptyPage,
  );
}

export async function getReviewablePurchases() {
  return withFallback(
    async () =>
      withAuthRefresh(async (options) =>
        getClient().customer.reviewablePurchases.list(options),
      ),
    { data: [], count: 0 },
  );
}

export async function createProductReview(params: CreateProductReviewParams) {
  return withAuthRefresh(async (options) =>
    getClient().customer.productReviews.create(params, options),
  );
}

export async function updateProductReview(
  id: string,
  params: UpdateProductReviewParams,
) {
  return withAuthRefresh(async (options) =>
    getClient().customer.productReviews.update(id, params, options),
  );
}

export async function uploadReviewImage(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("missing_file");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const checksum = createHash("md5").update(buffer).digest("base64");

  return withAuthRefresh(async (options) => {
    const client = getClient();
    const upload = await client.customer.directUploads.create(
      {
        blob: {
          filename: file.name,
          byte_size: file.size,
          checksum,
          content_type: file.type || "application/octet-stream",
        },
      },
      options,
    );

    const put = await fetch(upload.direct_upload.url, {
      method: "PUT",
      headers: upload.direct_upload.headers,
      body: buffer,
    });
    if (!put.ok) {
      throw new Error(`upload_failed_${put.status}`);
    }

    return upload.signed_id;
  });
}
