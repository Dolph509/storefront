import type { DiscoveryEventInput, Product } from "@spree/sdk";
import { recordDiscoveryEventsAction } from "@/lib/data/discovery";
import {
  discoveryDedupeKey,
  shouldEmitDiscoveryEvent,
} from "@/lib/discovery/dedupe";
import { getDiscoverySessionKey } from "@/lib/discovery/session";
import { persistDiscoveryContext } from "@/lib/discovery/storage";
import type { DiscoveryContext } from "@/lib/discovery/types";

function productIds(product: Product): {
  productId: string;
  variantId?: string;
} {
  return {
    productId: product.id,
    variantId: product.default_variant_id ?? undefined,
  };
}

function toEvent(
  context: DiscoveryContext,
  product: Product,
  eventType: "impression" | "click",
): DiscoveryEventInput {
  const { productId, variantId } = productIds(product);
  return {
    event_type: eventType,
    source_type: context.source,
    product_id: productId,
    variant_id: variantId,
    search_query_id: context.searchQueryId,
    list_id: context.listId,
    position: context.position,
    campaign_id: context.campaignId,
    placement_id: context.placementId,
    recommendation_type: context.recommendationType,
    source_id: context.sourceId,
  };
}

function sendEvents(events: DiscoveryEventInput[]): void {
  if (events.length === 0) return;
  const sessionKey = getDiscoverySessionKey();
  void recordDiscoveryEventsAction(sessionKey, events).catch((error) => {
    console.warn("[discovery] recordEvents failed", error);
  });
}

export function recordDiscoveryImpression(
  product: Product,
  context: DiscoveryContext,
  pageKey?: string,
): void {
  const key = discoveryDedupeKey("impression", product.id, context, pageKey);
  if (!shouldEmitDiscoveryEvent(key)) return;
  sendEvents([toEvent(context, product, "impression")]);
}

export function recordDiscoveryClick(
  product: Product,
  context: DiscoveryContext,
): void {
  persistDiscoveryContext(product.id, context);
  const key = discoveryDedupeKey("click", product.id, context);
  if (shouldEmitDiscoveryEvent(key)) {
    sendEvents([toEvent(context, product, "click")]);
  }
}

export {
  buildDiscoveryContext,
  withDiscoveryPosition,
} from "@/lib/discovery/list-context";
