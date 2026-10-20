import type { Category, Product } from "@spree/sdk";

export type PdpDiscoveryItem = {
  key: string;
  label: string;
  href: string;
  category?: Category;
  kind: "category" | "search";
};

export type PdpRelatedDiscoveryLimits = {
  chips: number;
  gridCategories: number;
  gridSearchTerms: number;
  pills: number;
  termPool: number;
};

export const PDP_RELATED_DISCOVERY_LIMITS: PdpRelatedDiscoveryLimits = {
  chips: 6,
  gridCategories: 6,
  gridSearchTerms: 6,
  pills: 12,
  termPool: 18,
};

export type PdpRelatedDiscoveryPlan = {
  chips: PdpDiscoveryItem[];
  gridTiles: PdpDiscoveryItem[];
  pills: PdpDiscoveryItem[];
  categories: Category[];
};

export function searchBrowseHref(basePath: string, term: string): string {
  return `${basePath}/products?q=${encodeURIComponent(term.trim())}`;
}

export function categoryBrowseHref(
  category: Category,
  basePath: string,
): string | null {
  if (!category.permalink) return null;
  return `${basePath}/c/${category.permalink}`;
}

export function primaryCategoryBrowseHref(
  product: Product,
  basePath: string,
): string {
  const primary = product.categories?.[0];
  if (!primary) return `${basePath}/products`;
  return categoryBrowseHref(primary, basePath) ?? `${basePath}/products`;
}

export function uniqueSearchTerms(product: Product, limit: number): string[] {
  const terms: string[] = [];
  const seen = new Set<string>();
  for (const tag of product.tags ?? []) {
    const normalized = tag.trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    terms.push(normalized);
    if (terms.length >= limit) return terms;
  }
  for (const category of product.categories ?? []) {
    const name = category.name?.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    terms.push(name);
    if (terms.length >= limit) return terms;
  }
  const nameTokens = product.name
    .replace(/\[.*?\]/g, "")
    .split(/\s+/)
    .map((token) => token.replace(/[^a-zA-Z0-9'-]/g, ""))
    .filter((token) => token.length > 3);
  for (const token of nameTokens) {
    const key = token.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    terms.push(token);
    if (terms.length >= limit) return terms;
  }
  return terms;
}

function searchDiscoveryItem(
  basePath: string,
  label: string,
): PdpDiscoveryItem {
  const key = label.toLowerCase();
  return {
    key: `search:${key}`,
    label,
    href: searchBrowseHref(basePath, label),
    kind: "search",
  };
}

export function buildCategoryDiscoveryItems(
  product: Product,
  basePath: string,
  limit: number,
): PdpDiscoveryItem[] {
  const items: PdpDiscoveryItem[] = [];
  const seen = new Set<string>();
  for (const category of product.categories ?? []) {
    const label = category.name?.trim();
    const href = categoryBrowseHref(category, basePath);
    if (!label || !href) continue;
    if (seen.has(category.id)) continue;
    seen.add(category.id);
    items.push({
      key: category.id,
      label,
      href,
      category,
      kind: "category",
    });
    if (items.length >= limit) break;
  }
  return items;
}

export function categoryForTerm(
  categories: Category[],
  term: string,
): Category | undefined {
  const key = term.toLowerCase();
  return categories.find((category) => category.name?.toLowerCase() === key);
}

function labelsFromItems(items: PdpDiscoveryItem[]): Set<string> {
  return new Set(items.map((item) => item.label.toLowerCase()));
}

/**
 * Single source for PDP related category/search links (chips, tile grid, pills).
 */
export function buildPdpRelatedDiscoveryPlan(
  product: Product,
  basePath: string,
  limits: PdpRelatedDiscoveryLimits = PDP_RELATED_DISCOVERY_LIMITS,
): PdpRelatedDiscoveryPlan {
  const categories = product.categories ?? [];
  const categoryTiles = buildCategoryDiscoveryItems(
    product,
    basePath,
    limits.gridCategories,
  );
  const categoryIdsInGrid = new Set(
    categoryTiles.map((item) => item.category?.id).filter(Boolean) as string[],
  );
  const gridLabels = labelsFromItems(categoryTiles);

  const terms = uniqueSearchTerms(product, limits.termPool);
  const gridSearch: PdpDiscoveryItem[] = [];
  for (const term of terms) {
    if (gridSearch.length >= limits.gridSearchTerms) break;
    const matched = categoryForTerm(categories, term);
    if (matched && categoryIdsInGrid.has(matched.id)) continue;
    if (gridLabels.has(term.toLowerCase())) continue;
    gridLabels.add(term.toLowerCase());
    gridSearch.push(searchDiscoveryItem(basePath, term));
  }
  const gridTiles = [...categoryTiles, ...gridSearch];

  const chips: PdpDiscoveryItem[] = [];
  const chipLabels = new Set<string>();
  for (const item of buildCategoryDiscoveryItems(
    product,
    basePath,
    limits.chips,
  )) {
    chips.push(item);
    chipLabels.add(item.label.toLowerCase());
  }
  if (chips.length < limits.chips) {
    for (const tag of product.tags ?? []) {
      const label = tag.trim();
      if (!label) continue;
      const key = label.toLowerCase();
      if (chipLabels.has(key)) continue;
      chipLabels.add(key);
      chips.push(searchDiscoveryItem(basePath, label));
      if (chips.length >= limits.chips) break;
    }
  }

  const usedLabels = labelsFromItems([...gridTiles, ...chips]);
  const pills: PdpDiscoveryItem[] = [];
  for (const term of terms) {
    if (pills.length >= limits.pills) break;
    const key = term.toLowerCase();
    if (usedLabels.has(key)) continue;
    usedLabels.add(key);
    pills.push(searchDiscoveryItem(basePath, term));
  }

  return { chips, gridTiles, pills, categories };
}

export function allDiscoveryItems(
  plan: PdpRelatedDiscoveryPlan,
): PdpDiscoveryItem[] {
  return [...plan.chips, ...plan.gridTiles, ...plan.pills];
}

export function buildChipDiscoveryItems(
  product: Product,
  basePath: string,
  limit: number,
): PdpDiscoveryItem[] {
  return buildPdpRelatedDiscoveryPlan(product, basePath, {
    ...PDP_RELATED_DISCOVERY_LIMITS,
    chips: limit,
  }).chips;
}
