"use client";

import { RegionPreferences } from "@/components/layout/RegionPreferences";

export function PromoBarRegionControl() {
  return (
    <div className="[&_button]:text-marketplace-promo-foreground [&_button]:hover:text-white [&_span]:text-marketplace-promo-foreground">
      <RegionPreferences variant="menu" />
    </div>
  );
}
