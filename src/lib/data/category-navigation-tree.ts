import type { Category } from "@spree/sdk";

export function buildCategoryNavigationTree(
  categories: Category[],
): Category[] {
  const nodes = new Map<string, Category>();
  for (const category of categories) {
    nodes.set(category.id, { ...category, children: [] });
  }

  const roots: Category[] = [];
  for (const category of categories) {
    const node = nodes.get(category.id);
    if (!node) continue;
    const parent = category.parent_id
      ? nodes.get(String(category.parent_id))
      : undefined;
    if (parent) parent.children?.push(node);
    else roots.push(node);
  }

  const sortTree = (items: Category[]) => {
    items.sort(
      (a, b) => a.position - b.position || a.name.localeCompare(b.name),
    );
    for (const item of items) sortTree(item.children ?? []);
  };
  sortTree(roots);
  return roots;
}
