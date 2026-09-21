"use server";

import type { ListParams } from "@spree/sdk";
import { getClient, withAuthRefresh } from "@/lib/spree";
import { withFallback } from "./utils";

export async function listOrderHelpRequests(
  orderId: string,
  params?: ListParams,
) {
  return withFallback(
    async () => {
      return withAuthRefresh(async (options) => {
        return getClient().orders.helpRequests.list(orderId, params, options);
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

export async function createOrderHelpRequest(
  orderId: string,
  params: { reason: string; requested_resolution?: string },
) {
  return withAuthRefresh(async (options) => {
    return getClient().orders.helpRequests.create(orderId, params, options);
  });
}

export async function hasOpenOrderHelpRequest(orderId: string) {
  const page = await listOrderHelpRequests(orderId, { limit: 25 });
  return page.data.some((request) => request.status === "open");
}
