import type { ThemeRenderContext } from "./types";

const ALLOWED_PATHS: Record<string, string[]> = {
  current_product: ["name", "description", "slug"],
  current_seller: ["name", "slug"],
  current_collection: ["name", "slug"],
  current_category: ["name", "slug"],
  current_page: ["name", "slug"],
  store: ["name"],
};

export function resolveThemeSetting(
  value: unknown,
  context: ThemeRenderContext,
  fallback?: unknown,
): unknown {
  if (!value || typeof value !== "object" || !("source" in value)) {
    return value ?? fallback ?? "";
  }

  const source = String((value as { source?: string }).source || "");
  const path = String((value as { path?: string }).path || "");
  const allowed = ALLOWED_PATHS[source];
  if (!allowed?.includes(path)) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[theme] rejected dynamic source ${source}.${path}`);
    }
    return fallback ?? "";
  }

  const resolved = readPath(context, source, path);
  return resolved ?? fallback ?? "";
}

function readPath(
  context: ThemeRenderContext,
  source: string,
  path: string,
): unknown {
  switch (source) {
    case "current_product":
      return context.kind === "product"
        ? (context.product as Record<string, unknown>)[path]
        : undefined;
    case "current_seller":
      if (context.kind === "product") {
        const seller = context.product.seller;
        return seller
          ? (seller as Record<string, unknown>)[path]
          : context.product.seller_name;
      }
      return undefined;
    case "current_page":
      return context.kind === "page"
        ? context[path === "name" ? "pageSlug" : "pageSlug"]
        : undefined;
    default:
      return undefined;
  }
}
