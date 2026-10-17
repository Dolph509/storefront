import type { Category } from "@spree/sdk";
import {
  resolveCategoryCoverImage,
  resolveSearchTermCoverImage,
} from "@/lib/data/pdp-discovery-cover";
import {
  categoryForTerm,
  type PdpDiscoveryItem,
} from "@/lib/pdp/discovery-items";

/** Keeps PDP render from fanning out dozens of catalog API calls. */
export const PDP_DISCOVERY_COVER_FETCH_LIMITS = {
  categoryProductLookups: 4,
  searchProductLookups: 6,
} as const;

export function discoveryItemCoverUrl(
  item: PdpDiscoveryItem,
  categories: Category[],
  categoryCovers: Map<string, string | null>,
  searchCovers: Map<string, string | null>,
): string | null {
  if (item.category) {
    return categoryCovers.get(item.category.id) ?? null;
  }
  const matched = categoryForTerm(categories, item.label);
  if (matched) {
    return (
      categoryCovers.get(matched.id) ??
      searchCovers.get(item.label.toLowerCase()) ??
      null
    );
  }
  return searchCovers.get(item.label.toLowerCase()) ?? null;
}

async function resolveCategoryCoversBounded(
  categories: Category[],
): Promise<Map<string, string | null>> {
  const covers = new Map<string, string | null>();
  const needsProductSample: Category[] = [];

  for (const category of categories) {
    const direct = category.square_image_url ?? category.image_url ?? null;
    if (direct) {
      covers.set(category.id, direct);
      continue;
    }
    needsProductSample.push(category);
  }

  for (const category of needsProductSample.slice(
    0,
    PDP_DISCOVERY_COVER_FETCH_LIMITS.categoryProductLookups,
  )) {
    covers.set(category.id, await resolveCategoryCoverImage(category));
  }

  for (const category of needsProductSample.slice(
    PDP_DISCOVERY_COVER_FETCH_LIMITS.categoryProductLookups,
  )) {
    covers.set(category.id, null);
  }

  return covers;
}

async function resolveSearchCoversBounded(
  terms: string[],
): Promise<Map<string, string | null>> {
  const covers = new Map<string, string | null>();
  const limited = terms.slice(
    0,
    PDP_DISCOVERY_COVER_FETCH_LIMITS.searchProductLookups,
  );

  await Promise.all(
    limited.map(async (term) => {
      covers.set(term.toLowerCase(), await resolveSearchTermCoverImage(term));
    }),
  );

  return covers;
}

export async function resolveDiscoveryItemCoverMap(
  items: PdpDiscoveryItem[],
  categories: Category[],
): Promise<Map<string, string | null>> {
  if (!items.length) return new Map();

  const categoryIds = new Set<string>();
  const searchLabels: string[] = [];

  for (const item of items) {
    if (item.category) {
      categoryIds.add(item.category.id);
      continue;
    }
    searchLabels.push(item.label);
    const matched = categoryForTerm(categories, item.label);
    if (matched) categoryIds.add(matched.id);
  }

  const categoriesToFetch = categories.filter((category) =>
    categoryIds.has(category.id),
  );

  const uniqueSearchLabels = [
    ...new Map(
      searchLabels.map((label) => [label.toLowerCase(), label] as const),
    ).values(),
  ];

  const [categoryCovers, searchCovers] = await Promise.all([
    resolveCategoryCoversBounded(categoriesToFetch),
    resolveSearchCoversBounded(uniqueSearchLabels),
  ]);

  const coverByItemKey = new Map<string, string | null>();
  for (const item of items) {
    coverByItemKey.set(
      item.key,
      discoveryItemCoverUrl(item, categories, categoryCovers, searchCovers),
    );
  }
  return coverByItemKey;
}
