import type { SponsoredSearchResult } from "@spree/sdk";

/** Registered discovery placements served via POST /advertising/placements */
export type DiscoveryAdsPlacement =
  | "homepage_rail"
  | "product_page_related"
  | "cart_recommendations"
  | "favorites_discovery"
  | "seller_shop_rail"
  | "account_discovery";

export type ListingAdsPlacement =
  | "search_results"
  | "category_results"
  | "collection_results";

export type AdsPlacement = DiscoveryAdsPlacement | ListingAdsPlacement;

export type FetchDiscoveryPlacementsInput = {
  placement: DiscoveryAdsPlacement;
  currency?: string;
  limit?: number;
  product_id?: string;
  category_id?: string;
  collection_id?: string;
  seller_id?: string;
  query_id?: string;
  organic_product_ids?: string[];
};

export type SponsoredProductRow = SponsoredSearchResult;

export type SponsoredListingCell =
  | { kind: "organic"; product: SponsoredSearchResult["product"] }
  | { kind: "sponsored"; row: SponsoredSearchResult };
