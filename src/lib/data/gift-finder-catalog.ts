"use server";

import type { Category } from "@spree/sdk";
import { getCategoryNavigationTree } from "./categories";
import { pickProductCoverImage } from "./pdp-discovery-cover";
import { getProducts } from "./products";
import { getTrendingProducts } from "./recommendations";

const fixtureLabel = /\[dev-dataset\]|\b(?:fixtures?|e2e|test sku)\b/i;

export async function giftCatalogDepartments(country: string, locale: string) {
  const roots = await getCategoryNavigationTree({ country, locale });
  function leaves(category: Category): Category[] {
    return category.children?.length
      ? category.children.flatMap(leaves)
      : [category];
  }
  const departments = roots.flatMap((root) =>
    root.children?.length ? root.children : [root],
  );
  const groups = departments.map((department) =>
    leaves(department).filter(
      (category) =>
        !category.is_root &&
        !fixtureLabel.test(category.name) &&
        !fixtureLabel.test(category.permalink),
    ),
  );
  const candidates: Category[] = [];
  for (
    let i = 0;
    candidates.length < 9 && groups.some((group) => group.length > i);
    i++
  ) {
    for (const group of groups)
      if (group[i] && candidates.length < 9) candidates.push(group[i]);
  }
  const ideas = await Promise.all(
    candidates.map(async (category) => {
      const response = await getProducts({
        in_category: category.id,
        limit: 6,
        fields: ["id", "purchasable", "thumbnail_url", "media"],
        expand: ["media"],
      });
      const products = response.data.filter((product) => product.purchasable);
      if (!products.length) return [];
      const image =
        category.square_image_url ||
        category.image_url ||
        products.map(pickProductCoverImage).find(Boolean) ||
        null;
      return [{ label: category.name, image }];
    }),
  );
  return ideas
    .flat()
    .sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)))
    .slice(0, 3);
}

export async function giftCatalogIdeas(query = "") {
  const term = query.trim().slice(0, 80);
  if (term && term.length < 2) return [];
  const [listings, trending] = await Promise.all([
    getProducts({
      ...(term ? { search: term } : { sort: "best_selling" as const }),
      limit: term ? 16 : 48,
      fields: [
        "id",
        "name",
        "categories",
        "tags",
        "purchasable",
        "thumbnail_url",
        "media",
      ],
      expand: ["categories", "media"],
    }),
    term
      ? Promise.resolve([])
      : getTrendingProducts(undefined, 24).catch(() => []),
  ]);
  const topics = new Map<
    string,
    { label: string; image: string | null; weight: number }
  >();
  const seenProducts = new Set<string>();
  for (const product of [...trending, ...listings.data]) {
    if (seenProducts.has(product.id)) continue;
    seenProducts.add(product.id);
    if (!product.purchasable || fixtureLabel.test(product.name)) continue;
    const categories = (product.categories ?? []).filter(
      (category) => !category.is_root,
    );
    const labels = categories.map((category) => category.name);
    labels.push(...(product.tags ?? []));
    if (term) labels.push(product.name);
    const seen = new Set<string>();
    for (const label of labels) {
      const clean = label.trim();
      const key = clean.toLowerCase();
      if (
        seen.has(key) ||
        fixtureLabel.test(clean) ||
        clean.length < 2 ||
        clean.length > 50
      )
        continue;
      seen.add(key);
      const topic = topics.get(key) ?? { label: clean, image: null, weight: 0 };
      topic.weight++;
      topic.image ||= pickProductCoverImage(product);
      topics.set(key, topic);
    }
  }
  return [...topics.values()]
    .sort((a, b) => {
      if (term) {
        const contains = (label: string) =>
          Number(label.toLowerCase().includes(term.toLowerCase()));
        const difference = contains(b.label) - contains(a.label);
        if (difference) return difference;
      }
      return b.weight - a.weight;
    })
    .slice(0, term ? 5 : 3)
    .map(({ label, image }) => ({ label, image }));
}
