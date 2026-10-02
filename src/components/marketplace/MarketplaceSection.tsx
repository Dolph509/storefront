import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface MarketplaceSectionProps extends ComponentProps<"section"> {
  surface?: "none" | "default" | "warm" | "elevated";
}

const surfaces = {
  none: "",
  default: "bg-marketplace-surface",
  warm: "bg-marketplace-surface-warm",
  elevated:
    "bg-marketplace-surface-elevated shadow-[var(--marketplace-shadow-card)]",
};

export function MarketplaceSection({
  className,
  surface = "none",
  ...props
}: MarketplaceSectionProps) {
  return (
    <section
      className={cn(
        "py-[var(--cms-section-spacing,var(--marketplace-space-section,3rem))]",
        surfaces[surface],
        className,
      )}
      {...props}
    />
  );
}
