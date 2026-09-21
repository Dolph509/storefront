"use server";

import type { ListParams } from "@spree/sdk";
import { getClient, withAuthRefresh } from "@/lib/spree";
import { withFallback } from "./utils";

export async function getBuyerOffers(params?: ListParams) {
  return withFallback(
    async () => {
      return withAuthRefresh(async (options) => {
        return getClient().customer.buyerOffers.list(params, options);
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
