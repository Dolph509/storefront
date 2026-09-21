import type { SearchRecoveryRelaxFilter } from "@spree/sdk";
import type { ActiveFilters } from "@/types/filters";

/** Apply backend recovery hints by clearing filters the API asked to relax. */
export function applySearchRecoveryRelaxation(
  filters: ActiveFilters,
  relax: SearchRecoveryRelaxFilter[],
): ActiveFilters {
  if (!relax.length) return filters;

  let next: ActiveFilters = {
    ...filters,
    optionValues: [...filters.optionValues],
  };
  for (const entry of relax) {
    switch (entry.remove) {
      case "with_option_value_ids":
        next = { ...next, optionValues: [] };
        break;
      case "price_gte":
      case "price_lte":
        next = { ...next, priceMin: undefined, priceMax: undefined };
        break;
      case "average_rating_gte":
        next = { ...next, ratingMin: undefined };
        break;
      default:
        break;
    }
  }
  return next;
}
