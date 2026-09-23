import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarketplaceSectionHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function MarketplaceSectionHeader({
  title,
  description,
  action,
  className,
}: MarketplaceSectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex items-end justify-between gap-4 text-marketplace-foreground lg:mb-8",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-marketplace-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
