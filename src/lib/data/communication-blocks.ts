"use server";

import { revalidatePath } from "next/cache";
import { getClient, withAuthRefresh } from "@/lib/spree";
import { withFallback } from "./utils";

function revalidateBuyerMessaging() {
  revalidatePath("/", "layout");
}

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
  const block = await withAuthRefresh(async (options) => {
    return getClient().customer.communicationBlocks.create(
      { seller_id: sellerId },
      options,
    );
  });
  revalidateBuyerMessaging();
  return block;
}

export async function unblockSeller(blockId: string) {
  const result = await withAuthRefresh(async (options) => {
    return getClient().customer.communicationBlocks.destroy(blockId, options);
  });
  revalidateBuyerMessaging();
  return result;
}
