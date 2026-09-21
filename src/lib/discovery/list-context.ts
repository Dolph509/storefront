import type { DiscoverySource } from "@spree/sdk";
import type {
  DiscoveryContext,
  ListDiscoveryOptions,
} from "@/lib/discovery/types";

const RECOMMENDATION_LIST_SOURCES: Record<string, DiscoverySource> = {
  "recommendation-similar": "recommendation_similar",
  "recommendation-shop": "recommendation_shop",
  "recommendation-trending": "recommendation_trending",
  "recommendation-new": "recommendation_new",
  "recommendation-followed-shops": "recommendation_followed_shops",
};

/**
 * Derive backend `source_type` from existing list IDs used across the storefront.
 */
export function sourceFromListId(
  listId: string,
  options: Pick<
    ListDiscoveryOptions,
    "searchQueryId" | "campaignId" | "placementId" | "sourceId"
  > = {},
): DiscoverySource {
  if (listId === "search-results" || options.searchQueryId) {
    return "search";
  }
  if (listId === "favorites") return "favorites";
  if (listId.startsWith("seller-shop")) return "seller_shop";
  if (RECOMMENDATION_LIST_SOURCES[listId]) {
    return RECOMMENDATION_LIST_SOURCES[listId];
  }
  if (listId.startsWith("merchandising-")) return "merchandising";
  if (listId.startsWith("category-")) return "category";
  if (listId.startsWith("collection-")) return "collection";
  if (listId.startsWith("home-")) return "homepage";
  return "unknown";
}

export function recommendationTypeFromListId(
  listId: string,
): string | undefined {
  if (listId === "recommendation-similar") return "similar";
  if (listId === "recommendation-shop") return "shop";
  if (listId === "recommendation-trending") return "trending";
  if (listId === "recommendation-new") return "new";
  if (listId === "recommendation-followed-shops") return "followed_shops";
  return undefined;
}

export function buildDiscoveryContext(
  options: ListDiscoveryOptions,
  position?: number,
): DiscoveryContext {
  const { listId, searchQueryId, campaignId, placementId, sourceId } = options;
  const source = sourceFromListId(listId, {
    searchQueryId,
    campaignId,
    placementId,
    sourceId,
  });

  const context: DiscoveryContext = {
    source,
    listId,
    position,
    searchQueryId,
    campaignId,
    placementId,
    recommendationType: recommendationTypeFromListId(listId),
  };

  if (listId.startsWith("category-") && !sourceId) {
    context.sourceId = listId.replace("category-", "");
  } else if (listId.startsWith("collection-") && !sourceId) {
    context.sourceId = listId.replace("collection-", "");
  } else if (listId.startsWith("merchandising-") && !placementId) {
    context.placementId = listId.replace("merchandising-", "");
  } else if (sourceId) {
    context.sourceId = sourceId;
  }

  return context;
}

export function withDiscoveryPosition(
  context: DiscoveryContext,
  position: number,
): DiscoveryContext {
  return { ...context, position };
}
