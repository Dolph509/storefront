import type { ReactNode } from "react";
import {
  EmptyStateIllustration,
  type EmptyStateName,
} from "@/components/empty-states/EmptyStateIllustration";
import { cn } from "@/lib/utils";

interface MarketplaceEmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  illustration?: EmptyStateName;
  className?: string;
}

export function MarketplaceEmptyState({
  title,
  description,
  action,
  illustration,
  className,
}: MarketplaceEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[var(--marketplace-radius-lg)] border border-marketplace-border-subtle bg-marketplace-surface px-6 py-12 text-center text-marketplace-foreground",
        className,
      )}
    >
      {illustration ? (
        <EmptyStateIllustration
          name={illustration}
          className="mb-5 text-marketplace-brand"
        />
      ) : null}
      <h2 className="text-xl font-semibold">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-marketplace-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
