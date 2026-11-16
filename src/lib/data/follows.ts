"use server";

import { getClient, withAuthRefresh } from "@/lib/spree";
import { actionResult } from "./utils";

export async function listFollowedShops(page = 1, limit = 24) {
  return actionResult(async () => {
    return withAuthRefresh((options) =>
      getClient().sellerFollows.list(
        { page, limit, expand: ["seller"] },
        options,
      ),
    );
  }, "Failed to load followed shops");
}

export async function followSeller(sellerId: string) {
  return actionResult(async () => {
    await withAuthRefresh(async (options) => {
      const client = getClient();
      await client.sellerFollows.create({ seller_id: sellerId }, options);
      const status = await client.sellerFollows.statuses(
        { seller_ids: [sellerId] },
        options,
      );
      if (status.data[sellerId] !== true) {
        throw new Error("Follow was not saved. Please try again.");
      }
    });
    return { ok: true as const };
  }, "Failed to follow shop");
}

export async function unfollowSeller(sellerId: string) {
  return actionResult(async () => {
    return withAuthRefresh(async (options) => {
      const page = await getClient().sellerFollows.list(
        { limit: 100 },
        options,
      );
      const match = page.data.find(
        (row) => (row as { seller_id?: string }).seller_id === sellerId,
      ) as { id: string } | undefined;
      if (match) {
        await getClient().sellerFollows.delete(match.id, options);
      }
      return { ok: true as const };
    });
  }, "Failed to unfollow shop");
}

export async function getFollowStatuses(sellerIds: string[]) {
  return actionResult(async () => {
    if (!sellerIds.length) return { data: {} as Record<string, boolean> };
    return withAuthRefresh((options) =>
      getClient().sellerFollows.statuses({ seller_ids: sellerIds }, options),
    );
  }, "Failed to load follow status");
}
