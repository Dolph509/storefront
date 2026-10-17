import type { Product } from "@spree/sdk";
import { cache } from "react";
import { resolveDiscoveryItemCoverMap } from "@/lib/pdp/discovery-item-covers";
import {
  allDiscoveryItems,
  buildPdpRelatedDiscoveryPlan,
  PDP_RELATED_DISCOVERY_LIMITS,
  type PdpRelatedDiscoveryLimits,
  type PdpRelatedDiscoveryPlan,
} from "@/lib/pdp/discovery-items";
import { promiseWithTimeout } from "@/lib/utils/promise-with-timeout";

export type PdpRelatedDiscoveryContext = {
  plan: PdpRelatedDiscoveryPlan;
  coverByItemKey: Map<string, string | null>;
};

const COVER_RESOLVE_TIMEOUT_MS = 4_000;

async function loadPdpRelatedDiscoveryImpl(
  product: Product,
  basePath: string,
  limits: PdpRelatedDiscoveryLimits = PDP_RELATED_DISCOVERY_LIMITS,
): Promise<PdpRelatedDiscoveryContext> {
  const plan = buildPdpRelatedDiscoveryPlan(product, basePath, limits);
  const items = allDiscoveryItems(plan);
  if (!items.length) {
    return { plan, coverByItemKey: new Map() };
  }

  const coverByItemKey = await promiseWithTimeout(
    resolveDiscoveryItemCoverMap(items, plan.categories).catch(
      () => new Map<string, string | null>(),
    ),
    COVER_RESOLVE_TIMEOUT_MS,
    new Map<string, string | null>(),
  );

  return { plan, coverByItemKey };
}

/** Per-request dedupe when chips + explore both load discovery data. */
export const loadPdpRelatedDiscovery = cache(loadPdpRelatedDiscoveryImpl);
