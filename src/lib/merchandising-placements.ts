import type { StoreMerchandisingPlacement } from "@spree/sdk";

export function placementsOfKind(
  placements: StoreMerchandisingPlacement[],
  kind: string,
): StoreMerchandisingPlacement[] {
  return placements.filter((placement) => placement.kind === kind);
}

export function firstPlacementOfKind(
  placements: StoreMerchandisingPlacement[],
  kind: string,
): StoreMerchandisingPlacement | undefined {
  return placements.find((placement) => placement.kind === kind);
}
