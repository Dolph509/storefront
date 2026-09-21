import type { DiscoveryContext } from "@/lib/discovery/types";

const STORAGE_PREFIX = "spree:discovery:product:";

function storageKey(productId: string): string {
  return `${STORAGE_PREFIX}${productId}`;
}

/** Persist qualified discovery context for PDP / refresh (session-scoped). */
export function persistDiscoveryContext(
  productId: string,
  context: DiscoveryContext,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(storageKey(productId), JSON.stringify(context));
  } catch (error) {
    console.warn("[discovery] persist failed", error);
  }
}

export function readPersistedDiscoveryContext(
  productId: string,
): DiscoveryContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(productId));
    if (!raw) return null;
    return JSON.parse(raw) as DiscoveryContext;
  } catch {
    return null;
  }
}

export function directDiscoveryContext(): DiscoveryContext {
  return { source: "direct" };
}
