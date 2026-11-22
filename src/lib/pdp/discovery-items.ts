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
  gridCategories: 4,
  gridSearchTerms: 8,
  pills: 14,
  termPool: 32,
};

export type PdpRelatedDiscoveryPlan = {
  chips: PdpDiscoveryItem[];
  gridTiles: PdpDiscoveryItem[];
  pills: PdpDiscoveryItem[];
  categories: Category[];
};

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "your",
  "into",
  "our",
  "are",
  "was",
  "were",
  "have",
  "has",
  "had",
  "not",
  "but",
  "all",
  "any",
  "can",
  "one",
  "two",
  "new",
  "dev",
  "sku",
  "set",
]);

function stripBracketTags(value: string): string {
  return value
    .replace(/\[.*?\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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
  const push = (raw: string): boolean => {
    const normalized = raw.replace(/\s+/g, " ").trim();
    if (!normalized) return false;
    const key = normalized.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    terms.push(normalized);
    return terms.length >= limit;
  };

  for (const tag of product.tags ?? []) {
    if (push(tag)) return terms;
  }

  for (const category of product.categories ?? []) {
    const clean = stripBracketTags(category.name ?? "");
    if (clean && push(clean)) return terms;
    for (const ancestor of category.ancestors ?? []) {
      const ancestorName = stripBracketTags(ancestor.name ?? "");
      if (ancestorName && push(ancestorName)) return terms;
    }
  }

  const cleanedTitle = stripBracketTags(product.name);
  const commaSegments = cleanedTitle
    .split(/[,|•·–—]+/)
    .map((part) => part.trim())
    .filter((part) => {
      const words = part.split(/\s+/).filter(Boolean);
      return words.length >= 2 && words.length <= 4;
    });
  for (const segment of commaSegments) {
    if (push(segment)) return terms;
  }

  const words = cleanedTitle
    .split(/\s+/)
    .map((token) => token.replace(/[^a-zA-Z0-9'-]/g, ""))
    .filter(
      (token) => token.length > 2 && !STOP_WORDS.has(token.toLowerCase()),
    );

  // Multi-word adjacent phrases from the title (e.g. "Custom Handmade", "Made Together Lamp")
  for (let i = 0; i < words.length - 1; i++) {
    if (push(`${words[i]} ${words[i + 1]}`)) return terms;
  }
  for (let i = 0; i < words.length - 2; i++) {
    if (push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`)) return terms;
  }

  // Head noun + descriptive craft/gift variations
  const headWord = words[words.length - 1];
  if (headWord && headWord.length > 2) {
    const modifiers: string[] = [];
    if (product.handmade_verified) modifiers.push("Handmade");
    if ((product.personalization_fields?.length ?? 0) > 0) {
      modifiers.push("Personalized", "Custom");
    }
    modifiers.push("Artisan", "Unique", "Gift");
    for (const mod of modifiers) {
      if (mod.toLowerCase() === headWord.toLowerCase()) continue;
      if (push(`${mod} ${headWord}`)) return terms;
    }
    const primaryCat = stripBracketTags(product.categories?.[0]?.name ?? "");
    if (
      primaryCat &&
      !primaryCat.toLowerCase().includes(headWord.toLowerCase())
    ) {
      if (push(`${primaryCat} ${headWord}`)) return terms;
    }
  }

  for (const token of words) {
    if (token.length <= 3) continue;
    if (push(token)) return terms;
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
  const key = stripBracketTags(term).toLowerCase();
  return categories.find((category) => {
    const raw = category.name?.trim().toLowerCase();
    const cleaned = stripBracketTags(category.name ?? "").toLowerCase();
    return raw === key || cleaned === key;
  });
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
