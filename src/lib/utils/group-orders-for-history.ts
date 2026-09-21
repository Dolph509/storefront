import type { Order } from "@spree/sdk";

export type OrderHistoryBucket = {
  key: string;
  groupNumber: string | null;
  placedAt: string | null;
  orders: Order[];
};

/** Presentation grouping for account order history (OrderGroup children together). */
export function groupOrdersForHistory(orders: Order[]): OrderHistoryBucket[] {
  const buckets: OrderHistoryBucket[] = [];
  const groupIndex = new Map<string, number>();

  for (const order of orders) {
    const groupId = order.order_group_id;
    if (!groupId) {
      buckets.push({
        key: order.id,
        groupNumber: null,
        placedAt: order.completed_at,
        orders: [order],
      });
      continue;
    }

    const existing = groupIndex.get(groupId);
    if (existing !== undefined) {
      buckets[existing].orders.push(order);
      continue;
    }

    groupIndex.set(groupId, buckets.length);
    buckets.push({
      key: groupId,
      groupNumber: order.order_group_number ?? null,
      placedAt: order.completed_at,
      orders: [order],
    });
  }

  return buckets;
}

export function sumOrderGroupDisplayTotal(orders: Order[]): string | null {
  if (orders.length === 1) return orders[0].display_total;
  const amounts = orders
    .map((order) => Number.parseFloat(order.total ?? "0"))
    .filter((value) => Number.isFinite(value));
  if (!amounts.length) return orders[0]?.display_total ?? null;
  const sum = amounts.reduce((acc, value) => acc + value, 0);
  const currency = orders[0]?.currency;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
    }).format(sum);
  } catch {
    return sum.toFixed(2);
  }
}
