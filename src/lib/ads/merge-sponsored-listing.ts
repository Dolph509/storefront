import type { Product, SponsoredSearchResult } from "@spree/sdk";
import type { SponsoredListingCell } from "@/lib/ads/placements";

/**
 * Interleaves sponsored rows at server-provided slot positions without
 * duplicating organic SKUs.
 */
export function mergeOrganicWithSponsored(
  organic: Product[],
  sponsored: SponsoredSearchResult[],
): SponsoredListingCell[] {
  const organicIds = new Set(organic.map((product) => product.id));
  const rows = sponsored
    .filter((row) => row.product?.id && !organicIds.has(row.product.id))
    .sort((a, b) => a.ad.slot_position - b.ad.slot_position);

  const cells: SponsoredListingCell[] = organic.map((product) => ({
    kind: "organic",
    product,
  }));

  for (const row of rows) {
    const index = Math.min(
      Math.max(0, (row.ad.slot_position ?? 1) - 1),
      cells.length,
    );
    const duplicate = cells.some(
      (cell) =>
        cell.kind === "sponsored" && cell.row.product.id === row.product.id,
    );
    if (duplicate) continue;
    cells.splice(index, 0, { kind: "sponsored", row });
  }

  return cells;
}
