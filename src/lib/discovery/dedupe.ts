import type { DiscoveryContext } from "@/lib/discovery/types";

const seen = new Set<string>();

export function discoveryDedupeKey(
  eventType: string,
  productId: string,
  context: DiscoveryContext,
  pageKey?: string,
): string {
  return [
    eventType,
    context.source,
    productId,
    context.searchQueryId ?? "",
    context.listId ?? "",
    String(context.position ?? ""),
    context.campaignId ?? "",
    context.placementId ?? "",
    pageKey ?? "",
  ].join("|");
}

export function shouldEmitDiscoveryEvent(key: string): boolean {
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
}

/** Test helper */
export function clearDiscoveryDedupeCache(): void {
  seen.clear();
}
