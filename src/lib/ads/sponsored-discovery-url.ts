import type { Product } from "@spree/sdk";
import {
  DISCOVERY_SOURCE_SPONSORED,
  productDetailPathSegment,
} from "@/lib/discovery-context";

export type SponsoredClickDiscovery = {
  source: "sponsored";
  placement: string;
  query_id?: string | null;
  ad_click_id: string;
  ad_campaign_id: string;
  ad_listing_id: string;
  seller_id: string;
  position?: number | null;
};

export function discoveryHrefFromSponsoredClick(
  basePath: string,
  productSlug: string,
  discovery: SponsoredClickDiscovery,
): string {
  const query = new URLSearchParams({
    src: DISCOVERY_SOURCE_SPONSORED,
    placement: discovery.placement,
    ad_click_id: discovery.ad_click_id,
    ad_campaign_id: discovery.ad_campaign_id,
    ad_listing_id: discovery.ad_listing_id,
    seller_id: discovery.seller_id,
  });
  if (discovery.query_id) query.set("query_id", discovery.query_id);
  if (discovery.position != null) query.set("pos", String(discovery.position));
  return `${basePath}/products/${productSlug}?${query.toString()}`;
}

export function sponsoredProductHrefForProduct(
  basePath: string,
  product: Pick<Product, "id" | "slug">,
  discovery: SponsoredClickDiscovery,
): string {
  return discoveryHrefFromSponsoredClick(
    basePath,
    productDetailPathSegment(product),
    discovery,
  );
}
