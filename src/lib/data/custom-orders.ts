"use server";

import { getAccessToken, getClient } from "@/lib/spree";

async function customerOptions() {
  const token = await getAccessToken();
  if (!token) throw new Error("SIGN_IN_REQUIRED");
  return { token };
}

export async function getCustomOrderRequests() {
  return getClient().customer.customOrderRequests.list(
    { limit: 50 },
    await customerOptions(),
  );
}

export async function getCustomOrderRequest(id: string) {
  return getClient().customer.customOrderRequests.get(
    id,
    await customerOptions(),
  );
}

export async function cancelCustomOrderRequest(id: string) {
  return getClient().customer.customOrderRequests.cancel(
    id,
    await customerOptions(),
  );
}
