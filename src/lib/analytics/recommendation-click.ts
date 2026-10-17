import type { MouseEvent } from "react";
import {
  type RecommendationSurface,
  trackRecommendationClick,
} from "@/lib/analytics/recommendation-attribution";
import {
  DISCOVERY_SOURCE_MARKETPLACE,
  DISCOVERY_SOURCE_SELLER_SHOP,
} from "@/lib/discovery-context";

export type RecommendationClickContext = {
  surface: RecommendationSurface | string;
  listId: string;
  personalized?: boolean;
  experiment?: string | null;
  position?: number;
};

/** List IDs used by personalized / discovery recommendation surfaces (never paid ads). */
export function isOrganicRecommendationListId(listId: string): boolean {
  const id = listId.trim();
  if (!id) return false;
  if (id.startsWith("merchandising-")) return false;
  if (id.startsWith("recommendation-")) return true;
  if (id.startsWith("account-")) return true;
  if (id.startsWith("cart:")) return true;
  if (id.startsWith("seller-discovery-")) return true;
  if (id === "favorites-discovery") return true;
  if (id.includes("-discovery-")) return true;
  return false;
}

export function inferRecommendationSurfaceFromListId(
  listId: string,
): RecommendationSurface | string {
  if (listId.startsWith("cart:")) return "cart";
  if (listId.startsWith("account-")) return "account";
  if (listId === "favorites-discovery") return "favorites";
  if (listId.startsWith("seller-discovery-")) return "seller_shop";
  if (listId.includes("category-discovery")) return "category";
  if (listId.includes("collection-discovery")) return "collection";
  if (listId.startsWith("recommendation-shop")) return "pdp";
  if (listId.startsWith("recommendation-similar")) return "pdp";
  if (listId.startsWith("recommendation-")) return "home_rail";
  return "home_rail";
}

export function recommendationClickFromHref(
  href: string,
): RecommendationClickContext | null {
  try {
    const url = new URL(href, "https://storefront.local");
    const src = url.searchParams.get("src");
    const listId = url.searchParams.get("list_id");
    if (!listId || !src) return null;
    if (
      src !== DISCOVERY_SOURCE_MARKETPLACE &&
      src !== DISCOVERY_SOURCE_SELLER_SHOP
    ) {
      return null;
    }
    if (!isOrganicRecommendationListId(listId)) return null;
    const posRaw = url.searchParams.get("pos");
    const position = posRaw ? Number.parseInt(posRaw, 10) + 1 : undefined;
    return {
      surface: inferRecommendationSurfaceFromListId(listId),
      listId,
      position: Number.isFinite(position) ? position : undefined,
    };
  } catch {
    return null;
  }
}

export function isPrimaryOrganicNavigationClick(
  event: Pick<
    MouseEvent,
    | "button"
    | "metaKey"
    | "ctrlKey"
    | "shiftKey"
    | "altKey"
    | "defaultPrevented"
  >,
): boolean {
  if (event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return false;
  return true;
}

export function recordRecommendationProductClick(
  event: Pick<
    MouseEvent,
    | "button"
    | "metaKey"
    | "ctrlKey"
    | "shiftKey"
    | "altKey"
    | "defaultPrevented"
  >,
  input: {
    productId: string;
    context?: RecommendationClickContext | null;
    href?: string;
    personalized?: boolean;
    experiment?: string | null;
  },
): void {
  if (!isPrimaryOrganicNavigationClick(event)) return;

  const context =
    input.context ??
    (input.href ? recommendationClickFromHref(input.href) : null);
  if (!context) return;

  trackRecommendationClick({
    productId: input.productId,
    surface: context.surface,
    listId: context.listId,
    personalized: input.personalized ?? context.personalized,
    experiment: input.experiment ?? context.experiment,
    position: context.position,
  });
}
