"use server";

import type { DiscoveryEventInput } from "@spree/sdk";
import { getClient } from "@/lib/spree";

/**
 * Persist marketplace discovery impressions/clicks via the Store API.
 * Called from client analytics helpers; failures are logged, not thrown.
 */
export async function recordDiscoveryEventsAction(
  sessionKey: string,
  events: DiscoveryEventInput[],
): Promise<void> {
  if (!sessionKey || events.length === 0) return;

  try {
    await getClient().marketplace.discovery.recordEvents({
      session_key: sessionKey,
      events,
    });
  } catch (error) {
    console.warn("[discovery] recordEvents failed", error);
  }
}
