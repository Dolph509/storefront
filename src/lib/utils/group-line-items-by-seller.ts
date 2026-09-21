import type { LineItem } from "@spree/sdk";

export type SellerLineItemGroup = {
  key: string;
  sellerId: string | null;
  sellerName: string;
  sellerSlug: string | null;
  items: LineItem[];
};

/**
 * Groups cart/order line items by seller for marketplace presentation.
 * First-party (no seller) lines share one "Marketplace" group.
 */
export function groupLineItemsBySeller(
  items: LineItem[],
  marketplaceLabel = "Marketplace",
): SellerLineItemGroup[] {
  const groups = new Map<string, SellerLineItemGroup>();

  for (const item of items) {
    const sellerId = item.seller_id ?? null;
    const key = sellerId ?? "__marketplace__";
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(item);
      continue;
    }

    groups.set(key, {
      key,
      sellerId,
      sellerName:
        item.seller?.name ||
        (item as LineItem & { seller_name?: string | null }).seller_name ||
        marketplaceLabel,
      sellerSlug:
        item.seller?.slug ||
        (item as LineItem & { seller_slug?: string | null }).seller_slug ||
        null,
      items: [item],
    });
  }

  return Array.from(groups.values());
}
