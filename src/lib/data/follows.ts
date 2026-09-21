"use server";

import { getAccessToken, getClient } from "@/lib/spree";
import { actionResult } from "./utils";

async function customerOptions() {
  const token = await getAccessToken();
  if (!token) throw new Error("SIGN_IN_REQUIRED");
  return { token };
}

export async function listFollowedShops(page = 1, limit = 24) {
  return actionResult(async () => {
    const options = await customerOptions();
    return getClient().sellerFollows.list(
      { page, limit, expand: ["seller"] },
      options,
    );
  }, "Failed to load followed shops");
}

export async function followSeller(sellerId: string) {
  return actionResult(async () => {
    const options = await customerOptions();
    await getClient().sellerFollows.create({ seller_id: sellerId }, options);
    return { ok: true as const };
  }, "Failed to follow shop");
}

export async function unfollowSeller(sellerId: string) {
  return actionResult(async () => {
    const options = await customerOptions();
    const page = await getClient().sellerFollows.list({ limit: 100 }, options);
    const match = page.data.find(
      (row) => (row as { seller_id?: string }).seller_id === sellerId,
    ) as { id: string } | undefined;
    if (match) {
      await getClient().sellerFollows.delete(match.id, options);
    }
    return { ok: true as const };
  }, "Failed to unfollow shop");
}

export async function getFollowStatuses(sellerIds: string[]) {
  return actionResult(async () => {
    if (!sellerIds.length) return { data: {} as Record<string, boolean> };
    const options = await customerOptions();
    return getClient().sellerFollows.statuses(
      { seller_ids: sellerIds },
      options,
    );
  }, "Failed to load follow status");
}
