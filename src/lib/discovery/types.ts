import type { DiscoverySource } from "@spree/sdk";

/** Storefront discovery attribution payload (maps to Store API + cart `discovery`). */
export type DiscoveryContext = {
  source: DiscoverySource;
  searchQueryId?: string;
  listId?: string;
  position?: number;
  campaignId?: string;
  placementId?: string;
  recommendationType?: string;
  sourceId?: string;
};

export type ListDiscoveryOptions = {
  listId: string;
  listName?: string;
  searchQueryId?: string;
  campaignId?: string;
  placementId?: string;
  sourceId?: string;
};
