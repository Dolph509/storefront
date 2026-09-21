"use server";

import { SpreeError } from "@spree/sdk";
import { getAccessToken, getClient } from "@/lib/spree";
import { actionResult } from "./utils";

const FAVORITES_NAME = "Favorites";

async function customerOptions() {
  const token = await getAccessToken();
  if (!token) throw new Error("SIGN_IN_REQUIRED");
  return { token };
}

async function defaultWishlist() {
  const options = await customerOptions();
  const client = getClient();
  const list = await client.wishlists.list({ limit: 50 }, options);
  const existing =
    list.data.find((wishlist) => wishlist.is_default) ||
    list.data.find((wishlist) => wishlist.name === FAVORITES_NAME);
  if (existing) return { wishlist: existing, options };

  const wishlist = await client.wishlists.create(
    {
      name: FAVORITES_NAME,
      is_default: true,
      is_private: true,
    },
    options,
  );
  return { wishlist, options };
}

export async function listFavorites() {
  return actionResult(async () => {
    const { wishlist, options } = await defaultWishlist();
    const detailed = await getClient().wishlists.get(
      wishlist.id,
      { expand: ["items", "items.variant", "items.product"] },
      options,
    );
    return { data: detailed.items ?? [], wishlistId: wishlist.id };
  }, "Failed to load favorites");
}

export async function addFavorite(input: {
  productId: string;
  variantId?: string;
}) {
  return actionResult(async () => {
    const { wishlist, options } = await defaultWishlist();
    let variantId = input.variantId;
    if (!variantId) {
      const product = await getClient().products.get(
        input.productId,
        {},
        options,
      );
      variantId = product.default_variant_id;
    }
    if (!variantId) {
      throw new SpreeError("Variant required", 422, "validation_error");
    }
    try {
      await getClient().wishlists.items.create(
        wishlist.id,
        { variant_id: variantId, quantity: 1 },
        options,
      );
    } catch (error) {
      if (!(error instanceof SpreeError && error.status === 422)) throw error;
    }
    return { ok: true as const };
  }, "Failed to save favorite");
}

export async function removeFavorite(input: {
  productId: string;
  variantId?: string;
}) {
  return actionResult(async () => {
    const { wishlist, options } = await defaultWishlist();
    const detailed = await getClient().wishlists.get(
      wishlist.id,
      { expand: ["items", "items.variant"] },
      options,
    );
    const items = detailed.items ?? [];
    const match = items.find((item) => {
      if (input.variantId && item.variant_id === input.variantId) return true;
      return item.product_id === input.productId;
    });
    if (match) {
      await getClient().wishlists.items.delete(wishlist.id, match.id, options);
    }
    return { ok: true as const };
  }, "Failed to remove favorite");
}
