"use server";

import { getClient, withAuthRefresh } from "@/lib/spree";
import { withFallback } from "./utils";

export async function listCommunicationBlocks() {
  return withFallback(
    async () => {
      return withAuthRefresh(async (options) => {
        return getClient().customer.communicationBlocks.list(options);
      });
    },
    {
      data: [],
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
    },
  );
}

export async function blockSeller(sellerId: string) {
  return withAuthRefresh(async (options) => {
    return getClient().customer.communicationBlocks.create(
      { seller_id: sellerId },
      options,
    );
  });
}

export async function unblockSeller(blockId: string) {
  return withAuthRefresh(async (options) => {
    return getClient().customer.communicationBlocks.destroy(blockId, options);
  });
}
