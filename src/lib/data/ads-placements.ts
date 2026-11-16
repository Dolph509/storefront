"use server";

import type { SponsoredSearchResult } from "@spree/sdk";
import { cookies } from "next/headers";
import type { FetchDiscoveryPlacementsInput } from "@/lib/ads/placements";
import { getClient, getLocaleOptions, withAuthRefresh } from "@/lib/spree";
import { promiseWithTimeout } from "@/lib/utils/promise-with-timeout";

const PLACEMENTS_TIMEOUT_MS = 2_500;

const TRAFFIC_SESSION_COOKIE = "spree_traffic_session";

/**
 * Server-side discovery placement inventory. Returns [] when ads are off or the API errors.
 */
export async function fetchDiscoveryPlacements(
  input: FetchDiscoveryPlacementsInput,
): Promise<SponsoredSearchResult[]> {
  try {
    const jar = await cookies();
    const sessionToken = jar.get(TRAFFIC_SESSION_COOKIE)?.value;
    const localeOptions = await getLocaleOptions();
    const body = {
      ...input,
      ...(sessionToken ? { session_token: sessionToken } : {}),
    };
    const response = await promiseWithTimeout(
      withAuthRefresh(() =>
        getClient().ads.placements.create(body, localeOptions),
      ),
      PLACEMENTS_TIMEOUT_MS,
      { data: [] as SponsoredSearchResult[] },
    );
    return response.data ?? [];
  } catch {
    return [];
  }
}
