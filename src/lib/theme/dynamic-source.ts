import type { ThemeRenderContext } from "./types";
import { getStoreName } from "@/lib/store";

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
      if (context.kind !== "product") return undefined;
      switch (path) {
        case "name": return context.product.name;
        case "description": return context.product.description;
        case "slug": return context.product.slug;
        default: return undefined;
      }
    case "current_seller":
      if (context.kind === "product") {
        const seller = context.product.seller;
        if (path === "name") return seller?.name ?? context.product.seller_name;
        return seller?.slug ?? context.product.seller_slug;
      }
      return undefined;
    case "current_page":
      if (context.kind !== "page") return undefined;
      return path === "name" ? context.pageName : context.pageSlug;
    case "current_category":
      if (context.kind === "category") {
        return path === "name" ? context.categoryName : context.categorySlug;
      }
      if (context.kind === "product") {
        const categories = context.product.categories ?? [];
        const category = categories.find((item) => item.id === context.categoryId) ?? categories[0];
        return path === "name" ? category?.name : category?.permalink;
      }
      return undefined;
    case "current_collection":
      return context.kind === "collection"
        ? path === "name" ? context.collectionName : context.collectionSlug
        : undefined;
    case "store":
      return getStoreName();
    default:
      return undefined;
  }
}
