import type { Order } from "@spree/sdk";

const DELIVERED_STATUSES = new Set(["fulfilled", "delivered"]);

/** Earliest delivery instant for a line item, matching store review eligibility. */
export function lineItemDeliveredAt(
  order: Order,
  lineItemId: string,
): string | null {
  const times: number[] = [];

  for (const fulfillment of order.fulfillments ?? []) {
    if (!DELIVERED_STATUSES.has(fulfillment.status)) continue;
    const itemIds = new Set(
      fulfillment.items?.map((entry) => entry.item_id) ?? [],
    );
    if (!itemIds.has(lineItemId)) continue;
    const stamp = fulfillment.delivered_at ?? fulfillment.fulfilled_at;
    if (stamp) {
      const parsed = Date.parse(stamp);
      if (!Number.isNaN(parsed)) times.push(parsed);
    }
  }

  if (times.length === 0) return null;
  return new Date(Math.min(...times)).toISOString();
}
