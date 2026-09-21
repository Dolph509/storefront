import type {
  Client,
  MerchandisingListParams,
  MerchandisingListResponse,
  RecommendationListParams,
  RecommendationListResponse,
} from "@spree/sdk";

function listQueryParams(
  params?: RecommendationListParams | MerchandisingListParams,
): Record<string, string | number> | undefined {
  if (!params) return undefined;
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (key === "expand" || key === "fields") {
      if (Array.isArray(value)) out[key] = value.join(",");
      continue;
    }
    if (typeof value === "number") {
      out[key] = value;
      continue;
    }
    if (Array.isArray(value)) {
      out[key] = value.join(",");
      continue;
    }
    out[key] = String(value);
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

type MarketplaceApi = NonNullable<Client["marketplace"]>;

/**
 * Marketplace Store API helpers. Uses `client.marketplace` when present; otherwise
 * calls the same paths through `client.request` (older SDK builds or bundlers that
 * drop class fields off the createClient wrapper).
 */
export function marketplaceFor(client: Client): MarketplaceApi {
  if (client.marketplace?.recommendations?.trending) {
    return client.marketplace;
  }

  const request = client.request.bind(client);

  return {
    recommendations: {
      trending: (params, options) =>
        request<RecommendationListResponse>(
          "GET",
          "/marketplace/recommendations/trending",
          { ...options, params: listQueryParams(params) },
        ),
      new: (params, options) =>
        request<RecommendationListResponse>(
          "GET",
          "/marketplace/recommendations/new",
          { ...options, params: listQueryParams(params) },
        ),
      followedShops: (params, options) =>
        request<RecommendationListResponse>(
          "GET",
          "/marketplace/recommendations/followed_shops",
          { ...options, params: listQueryParams(params) },
        ),
    },
    merchandising: {
      list: (params, options) =>
        request<MerchandisingListResponse>(
          "GET",
          "/marketplace/merchandising",
          {
            ...options,
            params: listQueryParams(params),
          },
        ),
    },
  };
}
