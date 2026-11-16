"use server";

import type { StoreTrafficEventsParams } from "@spree/sdk";
import { getClient } from "@/lib/spree";

export async function recordStoreTrafficEvents(
  body: StoreTrafficEventsParams,
): Promise<{ success: boolean }> {
  try {
    await getClient().traffic.record(body);
    return { success: true };
  } catch {
    return { success: false };
  }
}
