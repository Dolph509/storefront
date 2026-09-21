import type { CartDiscoveryInput } from "@spree/sdk";
import type { DiscoveryContext } from "@/lib/discovery/types";

/** Cart line discovery is snapshotted on successful add; merged lines keep the first attribution. */

export function toCartDiscoveryPayload(
  context: DiscoveryContext | null | undefined,
  sessionKey: string,
): CartDiscoveryInput | undefined {
  if (!context || !sessionKey) return undefined;

  const payload: CartDiscoveryInput = {
    source_type: context.source,
    session_key: sessionKey,
  };

  if (context.sourceId) payload.source_id = context.sourceId;
  if (context.searchQueryId) payload.search_query_id = context.searchQueryId;
  if (context.campaignId) payload.campaign_id = context.campaignId;
  if (context.placementId) payload.placement_id = context.placementId;
  if (context.listId) payload.list_id = context.listId;
  if (context.recommendationType) {
    payload.recommendation_type = context.recommendationType;
  }
  if (context.position != null) payload.position = context.position;

  return payload;
}
