import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarketplaceSectionHeaderProps {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  density?: "default" | "compact" | "etsy" | "home" | "listing";
  headingLevel?: "h1" | "h2";
}

export function MarketplaceSectionHeader({
  title,
  eyebrow,
  description,
  action,
  className,
  density = "default",
  headingLevel = "h2",
}: MarketplaceSectionHeaderProps) {
  const Heading = headingLevel;
  return (
    <div
      data-theme-section-header
      className={cn(
        density === "etsy" || density === "home"
          ? "mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-marketplace-border-subtle pb-3 text-marketplace-foreground md:mb-6 md:pb-4"
          : density === "compact"
            ? "mb-4 flex items-end justify-between gap-4 text-marketplace-foreground"
            : "mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 text-marketplace-foreground lg:mb-8",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-marketplace-brand-accent">
            {eyebrow}
          </p>
        ) : null}
        <Heading
          data-theme-section-heading
          className={cn(
            "text-balance tracking-[-0.02em]",
            density === "listing"
              ? "marketplace-listing-title"
              : density === "home"
                ? "font-display text-[clamp(1.5rem,1.25rem+1vw,2.125rem)] font-normal leading-[1.15]"
                : density === "etsy"
                  ? "font-display text-[clamp(1.375rem,1.2rem+0.7vw,1.75rem)] font-normal leading-[1.2]"
                  : density === "compact"
                    ? "font-display text-lg font-medium leading-snug sm:text-xl"
                    : "font-display text-[length:var(--marketplace-heading-size)] font-normal leading-[1.15]",
          )}
        >
          {title}
        </Heading>
        {description ? (
          <p
            data-theme-section-description
            className="mt-1.5 max-w-2xl text-sm leading-relaxed text-marketplace-muted-foreground"
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
