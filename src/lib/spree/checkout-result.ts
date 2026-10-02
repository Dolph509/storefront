import type { Order, OrderGroup } from "@spree/sdk";

/** Preserve the storefront's typed child orders across the SDK's broad API shape. */
export type CompletedOrderGroup = Omit<OrderGroup, "orders"> & {
  orders: Order[];
};
export type CompleteCartResult = Order | CompletedOrderGroup;
